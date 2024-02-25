import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';



@Injectable()
export class AuthService {
  private mailClient: ClientProxy;

  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {
    this.mailClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'mail_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
        const { password, ...result } = user;
        return result;
    }
    throw new NotFoundException('User was not found');
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOne(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already was registed with other user');
    }
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;

    const mailMessage = {
      to: user.email,
      fullName: user.fullName,
    };
  
    // *** This was commented by problems with RabbitMQ ***
    // ! here is no matching event handler defined in the remote service. Event pattern: send_mail
    // this.mailClient.emit('send_mail', mailMessage);
  
    try {
      await this.mailService.sendWelcomeEmail(user.email, user.fullName)
    } catch (error) {
      console.error('Error publishing message to the queue:', error);
    } 

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne(loginDto.email);
    
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.REFRESH_TOKEN_SECRET });
      const user = await this.usersService.findOne(payload.email);
      if (!user) {
        throw new Error('User not found');
      }
      const newAccessToken = this.jwtService.sign({ email: user.email, sub: user._id });
      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: any) {
    // ? Unnecessary by now
  }
}