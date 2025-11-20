import { Test, TestingModule } from '@nestjs/testing';
import { AuthController, AuthRequest } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
  };

  // Mock do AuthGuard para permitir teste sem JWT real
  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 10, email: 'test@test.com' }; // payload simulado
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // POST /auth/signup
  // -------------------------------------------------------
  it('should sign up a user', async () => {
    const dto = {
      email: 'test@test.com',
      password: '123456',
      role: UserRole.USER,
    };
    const expected = { id: 1, email: 'test@test.com' };

    mockAuthService.signUp.mockResolvedValue(expected);

    const result = await controller.signUp(dto);

    expect(authService.signUp).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  // -------------------------------------------------------
  // POST /auth/login
  // -------------------------------------------------------
  it('should login a user', async () => {
    const dto = { email: 'test@test.com', password: '123456' };
    const response = { accessToken: 'jwt.token.here' };

    mockAuthService.login.mockResolvedValue(response);

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });

  // -------------------------------------------------------
  // GET /auth/me
  // -------------------------------------------------------
  it('should return the user from request (AuthGuard applied)', () => {
    const req: AuthRequest = {
      user: { sub: 10, role: UserRole.USER },
    };

    const result = controller.getMyUser(req);

    expect(result).toEqual({
      sub: 10,
      role: UserRole.USER,
    });
  });
});
