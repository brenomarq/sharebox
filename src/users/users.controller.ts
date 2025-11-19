import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  getAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.findUserById(userId);
  }
}
