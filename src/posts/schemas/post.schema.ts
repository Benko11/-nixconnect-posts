import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Toggle } from './toggle.schema';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  contents: string;

  @Prop({ type: [Toggle], required: true })
  pings: Toggle[];

  @Prop({ type: [Number], required: true })
  throttles: number[];

  @Prop({ type: [Number], required: true })
  forks: number[];

  @Prop({ type: Boolean, default: false })
  isPrivate: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
