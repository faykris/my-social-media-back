import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);

        if (!canActivate) {
            return false;
        }

        const request = context.switchToHttp().getRequest();
        const accessToken = request.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            throw new UnauthorizedException('No access token provided');
        }

        const isBlacklisted = await this.redis.get(`blacklist:${accessToken}`);
        if (isBlacklisted) {
            throw new UnauthorizedException('Access token has been closed');
        }

        return true;
    
    }

}