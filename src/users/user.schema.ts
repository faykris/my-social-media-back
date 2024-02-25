import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Post } from '../posts/post.schema'; // Asegúrate de importar el esquema de Post

export type UserDocument = User & Document;

@Schema()
export class User {
  
  _id: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  age: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }] })
  posts: Post[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
