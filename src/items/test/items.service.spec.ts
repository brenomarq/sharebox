import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from '../items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ItemsService', () => {
  let service: ItemsService;
  let repo: Repository<Item>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repo = module.get<Repository<Item>>(getRepositoryToken(Item));

    jest.clearAllMocks();
  });

  // ------------------------------------------------------------
  // create
  // ------------------------------------------------------------
  it('should create and save an item', async () => {
    const dto = { name: 'Item 1', description: 'Test item' };
    const ownerId = 1;

    const item = { id: 1, ...dto, ownerId };

    mockRepository.create.mockReturnValue(item);
    mockRepository.save.mockResolvedValue(item);

    const result = await service.create(ownerId, dto);

    expect(repo.create).toHaveBeenCalledWith({ ...dto, ownerId });
    expect(repo.save).toHaveBeenCalledWith(item);
    expect(result).toEqual(item);
  });

  // ------------------------------------------------------------
  // findByOwner
  // ------------------------------------------------------------
  it('should find items by owner', async () => {
    const items = [{ id: 1, ownerId: 5 }];
    mockRepository.find.mockResolvedValue(items);

    const result = await service.findByOwner(5);

    expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: 5 } });
    expect(result).toEqual(items);
  });

  // ------------------------------------------------------------
  // findOneByOwner
  // ------------------------------------------------------------
  it('should return item if it belongs to the owner', async () => {
    const item = { id: 2, ownerId: 10 };
    mockRepository.findOne.mockResolvedValue(item);

    const result = await service.findOneByOwner(10, 2);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 2, ownerId: 10 },
    });
    expect(result).toEqual(item);
  });

  it('should throw NotFoundException if item not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOneByOwner(10, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ------------------------------------------------------------
  // findOne
  // ------------------------------------------------------------
  it('should return an item by ID', async () => {
    const item = { id: 3 };
    mockRepository.findOne.mockResolvedValue(item);

    const result = await service.findOne(3);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(result).toEqual(item);
  });

  it('should throw NotFoundException if item does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  // ------------------------------------------------------------
  // update
  // ------------------------------------------------------------
  it('should update an item when owner matches', async () => {
    const existingItem = { id: 4, ownerId: 2, name: 'Old' };
    const dto = { name: 'New' };
    const updatedItem = { ...existingItem, ...dto };

    mockRepository.findOne.mockResolvedValue(existingItem);
    mockRepository.save.mockResolvedValue(updatedItem);

    const result = await service.update(2, 4, dto);

    expect(result).toEqual(updatedItem);
    expect(existingItem.name).toBe('New');
    expect(repo.save).toHaveBeenCalledWith(updatedItem);
  });

  it('should throw NotFoundException if item is not owned by user (update)', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, 1, {})).rejects.toThrow(NotFoundException);
  });

  // ------------------------------------------------------------
  // remove
  // ------------------------------------------------------------
  it('should remove an item when owner matches', async () => {
    const item = { id: 5, ownerId: 3 };

    mockRepository.findOne.mockResolvedValue(item);
    mockRepository.remove.mockResolvedValue(item);

    const result = await service.remove(3, 5);

    expect(repo.remove).toHaveBeenCalledWith(item);
    expect(result).toEqual(item);
  });

  it('should throw NotFoundException if item is not owned by user (delete)', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(3, 5)).rejects.toThrow(NotFoundException);
  });

  // ------------------------------------------------------------
  // findAvailable
  // ------------------------------------------------------------
  it('should return available items with selected fields', async () => {
    const availableItems = [{ id: 1, name: 'A', available: true }];

    mockRepository.find.mockResolvedValue(availableItems);

    const result = await service.findAvailable();

    expect(repo.find).toHaveBeenCalledWith({
      where: { available: true },
      select: ['id', 'name', 'description', 'ownerId'],
    });
    expect(result).toEqual(availableItems);
  });
});
