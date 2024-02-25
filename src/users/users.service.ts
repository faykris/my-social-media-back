import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async addPostToUser(userId: string, postId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $push: { posts: postId.toString() } },
      { new: true }
    ).exec();
  }

  async removePostFromUser(userId: string, postId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { posts: postId } },
      { new: true }
    ).exec();
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(email: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email }, { ...updateUserDto, updatedAt: new Date() }, { new: true }
    ).exec();
  }

  async softDelete(email: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email }, { deletedAt: new Date() }, { new: true 
    }).exec();
  }
}
