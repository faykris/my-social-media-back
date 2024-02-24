import { Body, Controller, Delete, Get, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './update-user.dto'; // Asegúrate de crear este DTO

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUser(@Req() req) {
    return this.usersService.findOne(req.user.email);
  }

  @Put()
  async updateUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.email, updateUserDto);
  }

  @Delete()
  async deleteUser(@Req() req) {
    return this.usersService.softDelete(req.user.email);
  }
}
