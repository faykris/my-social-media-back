import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel({
      ...createUserDto,
      posts: [],
    });
    return newUser.save();
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(email: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.userModel.findOneAndUpdate({ email }, updateUserDto, { new: true }).exec();
  }

  async softDelete(email: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate({ email }, { deletedAt: new Date() }, { new: true }).exec();
  }
}
