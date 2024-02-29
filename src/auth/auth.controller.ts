import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './login.dto';
import { RefreshTokenGuard } from './refresh-token.guard';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { MailService } from 'src/mail/mail.service';

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
  async logout(@Query('refresh_token') token: string, @Res() res) {
    return res.status(200).json({ message: 'Logged out successfully.' });
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refresh(@Query('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }

  @MessagePattern('send_mail')
  async handleSendMail(@Payload()data: {to: string, fullName: string}) {
    const { to, fullName } = data;
    await this.mailService.sendWelcomeEmail(to, fullName);
  }
}