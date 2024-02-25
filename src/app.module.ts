import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import { PostsService } from './posts/posts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { PostsController } from './posts/posts.controller';
import { PostsModule } from './posts/posts.module';
import { MessageQueueModule } from './message-queue/message-queue.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    MessageQueueModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}
