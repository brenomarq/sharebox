import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  create(ownerId: number, dto: CreateItemDto) {
    const item = this.repo.create({ ...dto, ownerId });
    return this.repo.save(item);
  }

  async findByOwner(userId: number) {
    return await this.repo.find({
      where: { ownerId: userId },
    });
  }

  async findOneByOwner(ownerId: number, itemId: number) {
    const item = await this.repo.findOne({
      where: { id: itemId, ownerId: ownerId },
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(userId: number, id: number, dto: UpdateItemDto) {
    const item = await this.findOneByOwner(userId, id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(userId: number, id: number) {
    const item = await this.findOneByOwner(userId, id);
    return this.repo.remove(item);
  }

  findAvailable() {
    return this.repo.find({
      where: { available: true },
      select: ['id', 'name', 'description', 'ownerId'],
    });
  }
}
