import { Injectable, NotFoundException } from '@nestjs/common';
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
    const newPost = new this.postModel({ ...createPostDto, userId: user.userId });
    await newPost.save();

    await this.usersService.addPostToUser(user.userId, newPost._id);

    return newPost;
  }

  async update(id: string, updatePostDto: UpdatePostDto, ): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post Not Found');
    }
    return this.postModel.findByIdAndUpdate(
      id, {...updatePostDto, updatedAt: new Date()}, { new: true }
    ).exec();
  }

  async findAll(filter: { userId?: string, page?: number, perPage?: number }): Promise<Post[]> {
    const { userId, page, perPage } = filter;
    let query = {};

    if (userId) {
      query = { ...query, userId };
    }

    if (page && perPage) {
      const skip = (page - 1) * perPage;
      const limit = perPage;
      return this.postModel.find(query).skip(skip).limit(limit).exec();
    }

    return this.postModel.find(query).exec();
  }

  async softDelete(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException('Post Not Found');
    }
    await this.usersService.removePostFromUser(post.userId.toString(), id);
    return this.postModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).exec();
  }
}