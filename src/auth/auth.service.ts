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

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userService.findByEmail(signUpDto.email);

    if (existingUser) throw new ConflictException('User already exists');

    const newUser = await this.userService.createUser(signUpDto);

    return newUser;
  }

  async login(loginDto: LoginDto) {
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

    return payload;
  }
}
