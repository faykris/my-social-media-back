import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('post')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req ) {
    return this.postsService.create(createPostDto, req.user );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPosts(
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
  ) {
    return this.postsService.findAll({
      userId, page, perPage
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.softDelete(id);
  }
}
