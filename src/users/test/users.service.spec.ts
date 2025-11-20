import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

import { hash } from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  // ------------------------------------------- //
  // findByEmail
  // ------------------------------------------- //
  it('should return a user by email', async () => {
    const user = { id: 1, email: 'test@test.com' } as User;

    mockRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findByEmail('test@test.com');

    expect(result).toEqual(user);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
  });

  it('should return null if user not found by email', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    const result = await service.findByEmail('x@test.com');

    expect(result).toBeNull();
  });

  // ------------------------------------------- //
  // createUser
  // ------------------------------------------- //
  it('should create a new user with hashed password', async () => {
    const dto = {
      email: 'test@test.com',
      password: '123456',
      role: UserRole.USER,
    };

    const mockCreatedUser = {
      id: 1,
      email: dto.email,
      password: 'hashed_password',
    };

    mockRepository.create.mockReturnValue(mockCreatedUser);
    mockRepository.save.mockResolvedValue(mockCreatedUser);

    const result = await service.createUser(dto);

    expect(hash).toHaveBeenCalledWith('123456', 10);
    expect(mockRepository.create).toHaveBeenCalledWith({
      ...dto,
      password: 'hashed_password',
    });
    expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedUser);
    expect(result).toEqual(mockCreatedUser);
  });

  // ------------------------------------------- //
  // findAllUsers
  // ------------------------------------------- //
  it('should return a list of users', async () => {
    const users = [{ id: 1, email: 'a@test.com' }] as User[];

    mockRepository.find.mockResolvedValue(users);

    const result = await service.findAllUsers();

    expect(result).toEqual(users);
    expect(mockRepository.find).toHaveBeenCalledWith({
      select: ['id', 'email', 'role', 'createdAt'],
    });
  });

  // ------------------------------------------- //
  // findUserById
  // ------------------------------------------- //
  it('should return a user by ID', async () => {
    const user = { id: 1, email: 'test@test.com' } as User;

    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findUserById(1);

    expect(result).toEqual(user);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      select: ['id', 'email', 'role'],
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findUserById(99)).rejects.toThrow(NotFoundException);
  });
});
