import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncidentsModule } from './incidents/incidents.module';
import { SignalsModule } from './signals/signals.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Rate Limiting to prevent cascading failures
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000, // 1000 requests per minute per IP
    }]),
    // Global BullMQ Configuration for high-concurrency (10k/sec)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    // MongoDB for high-volume signal audit logs
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ims_signals'
    ),
    // Core Modules
    CommonModule,
    IncidentsModule,
    SignalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
