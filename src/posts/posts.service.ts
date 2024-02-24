import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';
import { User, UserDocument } from 'src/users/user.schema';
import { UpdateUserDto } from 'src/users/update-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private usersService: UsersService
) {}

async create(createPostDto: CreatePostDto, user: any): Promise<Post> {
    const newPost = new this.postModel({ ...createPostDto, userId: user._id });
    await newPost.save();

    await this.usersService.addPostToUser(user._id, newPost._id);

    return newPost;
  }

  async update(id: string, updatePostDto: UpdatePostDto, ): Promise<Post | null> {
    return this.postModel.findByIdAndUpdate(id, updatePostDto, { new: true }).exec();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().exec();
  }

  async softDelete(id: string): Promise<Post | null> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      return null;
    }
    await this.usersService.removePostFromUser(post.userId.toString(), id);
    
    return this.postModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
  }
}