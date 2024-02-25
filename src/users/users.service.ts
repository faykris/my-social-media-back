import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UsersService {
  private mailTransporter;
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.mailTransporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_API_SECRET,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, Number(process.env.SALT_NUMBER));
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
      { email }, { deletedAt: new Date() }, { new: true }).exec();
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailMessage = {
      to: email,
      subject: 'Registro exitoso',
      html: `
      <h1>Bienvenido <span>${fullName}<span> a Mi Red Social</h1>
      <p>Ya podrás inciar sesión y compartir tus publicaciones con la comunidad.</p>
      `,
    };


    try {
      await this.mailTransporter.sendMail({
        from: '"My Social Media" <faykris28@gmail.com>',
        to: mailMessage.to,
        subject: mailMessage.subject,
        html: mailMessage.html,
      });
    } catch (error) {
      console.error('Error sending email', error);
    }
  }
}
