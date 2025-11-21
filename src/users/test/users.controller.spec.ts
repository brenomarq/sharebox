import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    increasePoints: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // GET /users/all
  // -------------------------------------------------------
  it('should return all users', async () => {
    const users = [
      { id: 1, email: 'test1@test.com' },
      { id: 2, email: 'test2@test.com' },
    ];

    mockUsersService.findAllUsers.mockResolvedValue(users);

    const result = await controller.getAllUsers();

    expect(service.findAllUsers).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  // -------------------------------------------------------
  // GET /users/:id
  // -------------------------------------------------------
  it('should return user by ID', async () => {
    const user = { id: 5, email: 'user@test.com' };

    mockUsersService.findUserById.mockResolvedValue(user);

    const result = await controller.getUser(5);

    expect(service.findUserById).toHaveBeenCalledWith(5);
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException when user not found', async () => {
    mockUsersService.findUserById.mockRejectedValue(new NotFoundException());

    await expect(controller.getUser(999)).rejects.toThrow(NotFoundException);
  });

  it('should increase the points of a user', async () => {
    const userId = 1;
    const points = { points: 50 };
    const expectedValue = {
      id: userId,
      email: 'teste@gmail.com',
      role: UserRole.USER,
      score: 100 + points.points,
    };

    mockUsersService.increasePoints.mockResolvedValue(expectedValue);

    const result = await controller.increasePoints(1, points);

    expect(service.increasePoints).toHaveBeenCalled();
    expect(result).toEqual(expectedValue);
  });
});
