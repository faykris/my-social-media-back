import { IsOptional, IsString } from 'class-validator';
import { CreatePostDto } from 'src/posts/create-post.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  age?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  post?: CreatePostDto;
}