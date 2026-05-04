import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal } from './schemas/signal.schema';
import { ObservabilityService } from '../common/observability.service';

@Processor('signal-queue')
export class SignalProcessor extends WorkerHost {
  constructor(
    @InjectModel(Signal.name) private signalModel: Model<Signal>,
    private observability: ObservabilityService // Injected to track metrics
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { workItemId, componentId, payload } = job.data;

    try {
      // 1. Persistence: Save raw signal to MongoDB (The Audit Log)
      await this.signalModel.create({
        workItemId,
        componentId,
        rawPayload: payload,
        timestamp: new Date(),
      });

      // 2. Metrics: Increment the counter for throughput calculation
      await this.observability.incrementSignalCount();

      return { success: true };
    } catch (error) {
      // 3. Resilience: Log error and throw so BullMQ can retry based on config
      console.error(`Failed to process signal for ${componentId}:`, error);
      throw error; 
    }
  }
}