import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import type { AuthRequest } from 'src/auth/auth.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Request() req: AuthRequest, @Body() dto: CreateItemDto) {
    return this.service.create(req.user.sub, dto);
  }

  @Get('owner/:id')
  findAllByOwner(@Param('id', ParseIntPipe) ownerId: number) {
    return this.service.findByOwner(ownerId);
  }

  @Get('available')
  findAvailable() {
    return this.service.findAvailable();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Request() req: AuthRequest,
    @Param('id') id: number,
    @Body() dto: UpdateItemDto,
  ) {
    return this.service.update(req.user.sub, id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() req: AuthRequest, @Param('id') id: number) {
    return this.service.remove(req.user.sub, id);
  }
}
