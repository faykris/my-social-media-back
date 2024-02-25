import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Req() req) {
    return this.usersService.findOne(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.email, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@Req() req) {
    return this.usersService.softDelete(req.user.email);
  }
}
