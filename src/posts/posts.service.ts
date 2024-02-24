import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    return this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async softDelete(id: string): Promise<Post | null> {
    return this.postModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
  }
}