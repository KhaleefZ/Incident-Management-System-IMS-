import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { SignalProcessor } from './signals.processor';
import { Signal, SignalSchema } from './schemas/signal.schema';
import { PrismaService } from '../../prisma/prisma.service';
import { ObservabilityService } from '../common/observability.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Signal.name, schema: SignalSchema }]),
    BullModule.registerQueue(
      { name: 'signal-queue', defaultJobOptions: { attempts: 3 } }
    ),
  ],
  controllers: [SignalsController],
  providers: [SignalsService, SignalProcessor, PrismaService, ObservabilityService],
  exports: [SignalsService],
})
export class SignalsModule {}