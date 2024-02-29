import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';
import { CreateUserDto } from 'src/users/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RefreshDto } from './refresh.dto';



@Injectable()
export class AuthService {
  private mailClient: ClientProxy;

  constructor(
    private usersService: UsersService,
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

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
        return user;
    }
    throw new NotFoundException('User was not found');
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
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
    // * Send email into message queue 
    this.mailClient.emit('send_mail', mailMessage);
 
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async refreshToken(refreshDto: RefreshDto) {
    try {
      const payload = await this.jwtService.verify(
        refreshDto.refreshToken, { secret: process.env.JWT_SECRET, ignoreExpiration: true }
      );
      const user = await this.usersService.findOne(payload.email);
      if (!user) {
        throw new Error('User not found');
      }
      const newAccessToken = this.jwtService.sign({ email: user.email, sub: user._id });
      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      console.error(error)
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(user: any) {
    // ? Unnecessary by now
  }
}
