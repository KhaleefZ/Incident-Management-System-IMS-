import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class SignalsService {
  // Connects to ims_redis (Ensure your .env matches the docker service name if inside Docker)
  private redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  constructor(
    private prisma: PrismaService,
    @InjectQueue('signal-queue') private signalQueue: Queue, // BullMQ Queue
  ) {}

  async ingestSignal(dto: { componentId: string; severity: string; payload: any }) {
    const cacheKey = `debounce:${dto.componentId}`;
    
    // 1. Debouncing: Check Redis for an existing Work Item ID
    let workItemId = await this.redis.get(cacheKey);

    if (!workItemId) {
      // 2. Create Work Item in Postgres (Source of Truth)
      // This is the only synchronous DB hit, triggered once every 10s per component.
      const newIncident = await this.prisma.workItem.create({
        data: {
          componentId: dto.componentId,
          severity: dto.severity,
          status: 'OPEN',
        },
      });
      workItemId = String(newIncident.id);

      // 3. Set Redis TTL for 10 seconds to prevent duplicate Work Items
      await this.redis.setex(cacheKey, 10, workItemId);
    }

    // 4. Backpressure: Push raw signal to BullMQ for Async processing
    // The API now returns immediately while the Worker handles MongoDB writes.
    await this.signalQueue.add('process-signal', {
      workItemId,
      componentId: dto.componentId,
      payload: dto.payload,
    }, {
      removeOnComplete: true, // Clean up Redis memory
      attempts: 3,           // Retry logic for resilience[cite: 1]
    });

    return { workItemId, status: 'QUEUED' };
  }
}