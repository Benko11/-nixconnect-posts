import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Toggle {
  @Prop({ required: true })
  userId: number;
}
