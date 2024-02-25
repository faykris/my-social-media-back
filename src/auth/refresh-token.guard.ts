import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.query.refresh_token;

    try {
      this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET, ignoreExpiration: true });
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
