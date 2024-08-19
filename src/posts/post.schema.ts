import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Post {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  contents: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
