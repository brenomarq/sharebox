import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PointDto } from './dto/point.dto';

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

  @Post('points/add/user/:id')
  increasePoints(
    @Param('id', ParseIntPipe) userId: number,
    @Body(ValidationPipe) dto: PointDto,
  ) {
    return this.usersService.increasePoints(userId, dto.points);
  }
}
