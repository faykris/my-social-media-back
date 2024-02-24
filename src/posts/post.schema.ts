import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: User | Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
