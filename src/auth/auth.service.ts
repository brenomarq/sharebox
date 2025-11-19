import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const existingUser = await this.userService.findByEmail(signUpDto.email);

    if (existingUser) throw new ConflictException('User already exists');

    const newUser = await this.userService.createUser(signUpDto);

    return newUser;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const existingUser = await this.userService.findByEmail(loginDto.email);

    if (!existingUser) throw new NotFoundException('User does not exist');

    const matchPassword: boolean = await compare(
      loginDto.password,
      existingUser.password,
    );

    if (!matchPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const payload = { sub: existingUser.id, role: existingUser.role };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
      }),
    };
  }
}

export interface LoginResponse {
  access_token: string;
}
