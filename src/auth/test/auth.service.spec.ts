import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  // -----------------------------------------------------------------------------------

  describe('Login', () => {
    it('should throw if email not found', async () => {
      const dto: LoginDto = { email: 'x@mail.com', password: '123' };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        new HttpException('User does not exist', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw if password does not match', async () => {
      const dto: LoginDto = { email: 'test@mail.com', password: '123' };

      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed_password',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(
        new HttpException('Passwords do not match', HttpStatus.UNAUTHORIZED),
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        'hashed_password',
      );
    });

    it('should return access_token when credentials are correct', async () => {
      const dto: LoginDto = { email: 'test@mail.com', password: '123' };

      usersService.findByEmail.mockResolvedValue({
        id: 1,
        email: dto.email,
        password: 'hashed_password',
        role: UserRole.USER,
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.signAsync.mockResolvedValue('token_123');

      const result = await authService.login(dto);

      expect(result).toEqual({ access_token: 'token_123' });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 1, role: UserRole.USER },
        { secret: process.env.SECRET_KEY },
      );
    });
  });

  // -----------------------------------------------------------------------------------

  describe('SignUp', () => {
    it('should throw if user already exists', async () => {
      const dto: SignUpDto = {
        email: 'test@mail.com',
        password: '123456',
        role: UserRole.USER,
      };
      usersService.findByEmail.mockResolvedValue({ id: 1 } as any);
      await expect(authService.signUp(dto)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });

    it('should create user and return it', async () => {
      const dto: SignUpDto = {
        email: 'new@mail.com',
        password: '123456',
        role: UserRole.USER,
      };

      usersService.findByEmail.mockResolvedValue(null);
      const createdUser = {
        id: 10,
        email: dto.email,
        role: dto.role,
      };

      usersService.createUser.mockResolvedValue(createdUser as any);
      const result = await authService.signUp(dto);
      expect(result).toEqual(createdUser);
      expect(usersService.createUser).toHaveBeenCalledWith(dto);
    });
  });
});
