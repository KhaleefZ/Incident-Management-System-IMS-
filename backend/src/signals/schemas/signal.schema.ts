import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Signal extends Document {
  @Prop({ required: true, index: true })
  workItemId!: string;

  @Prop({ required: true })
  componentId!: string;

  @Prop({ type: Object })
  rawPayload?: any;

  @Prop({ default: Date.now })
  timestamp!: Date;
}

export const SignalSchema = SchemaFactory.createForClass(Signal);