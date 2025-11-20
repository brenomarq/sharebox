import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from '../items.controller';
import { ItemsService } from '../items.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { AuthRequest } from 'src/auth/auth.controller';
import { UserRole } from 'src/users/entities/user.entity';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  const mockItemsService = {
    create: jest.fn(),
    findByOwner: jest.fn(),
    findAvailable: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // POST /items/create
  // -------------------------------------------------------------------
  describe('create', () => {
    it('should create an item when auth guard allows', async () => {
      const req: AuthRequest = { user: { sub: 10, role: UserRole.USER } };
      const dto: CreateItemDto = { name: 'Item X', price: 100 } as any;

      mockItemsService.create.mockResolvedValue({ id: 1, ...dto });

      const result = await controller.create(req, dto);

      expect(service.create).toHaveBeenCalledWith(10, dto);
      expect(result).toEqual({ id: 1, ...dto });
    });
  });

  // -------------------------------------------------------------------
  // GET /items/owner/:id
  // -------------------------------------------------------------------
  describe('findAllByOwner', () => {
    it('should return items by owner', async () => {
      mockItemsService.findByOwner.mockResolvedValue([{ id: 1 }]);

      const result = await controller.findAllByOwner(5);

      expect(service.findByOwner).toHaveBeenCalledWith(5);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  // -------------------------------------------------------------------
  // GET /items/available
  // -------------------------------------------------------------------
  describe('findAvailable', () => {
    it('should return available items', async () => {
      mockItemsService.findAvailable.mockResolvedValue([
        { id: 1, available: true },
      ]);

      const result = await controller.findAvailable();

      expect(service.findAvailable).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, available: true }]);
    });
  });

  // -------------------------------------------------------------------
  // GET /items/:id
  // -------------------------------------------------------------------
  describe('findOne', () => {
    it('should return an item', async () => {
      mockItemsService.findOne.mockResolvedValue({ id: 1 });

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });

  // -------------------------------------------------------------------
  // PATCH /items/:id
  // -------------------------------------------------------------------
  describe('update', () => {
    it('should update an item when authenticated', async () => {
      const req: AuthRequest = { user: { sub: 7, role: UserRole.USER } };
      const dto: UpdateItemDto = { name: 'New Name' } as any;

      mockItemsService.update.mockResolvedValue({ id: 2, ...dto });

      const result = await controller.update(req, 2, dto);

      expect(service.update).toHaveBeenCalledWith(7, 2, dto);
      expect(result).toEqual({ id: 2, ...dto });
    });
  });

  // -------------------------------------------------------------------
  // DELETE /items/:id
  // -------------------------------------------------------------------
  describe('remove', () => {
    it('should remove an item when authenticated', async () => {
      const req: AuthRequest = { user: { sub: 3, role: UserRole.USER } };

      mockItemsService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(req, 99);

      expect(service.remove).toHaveBeenCalledWith(3, 99);
      expect(result).toEqual({ deleted: true });
    });
  });
});
