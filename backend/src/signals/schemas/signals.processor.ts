import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Signal } from './signal.schema';

@Processor('signal-queue')
export class SignalProcessor extends WorkerHost {
  constructor(@InjectModel(Signal.name) private signalModel: Model<Signal>) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { workItemId, componentId, payload } = job.data;

    // Save to MongoDB (Audit Log)
    await this.signalModel.create({
      workItemId,
      componentId,
      rawPayload: payload,
    });

    // You can also add logic here to update metrics in Redis
    return {};
  }
}