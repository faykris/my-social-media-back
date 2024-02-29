import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './login.dto';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { MailService } from 'src/mail/mail.service';
import { RefreshDto } from './refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: any) {
    return await this.authService.logout(request.headers.authorization?.split(' ')[1]);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refreshToken(refreshDto);
  }

  @MessagePattern('send_mail')
  async handleSendMail(@Payload()data: {to: string, fullName: string}) {
    const { to, fullName } = data;
    await this.mailService.sendWelcomeEmail(to, fullName);
  }
}
