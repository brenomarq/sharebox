import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userService.findByEmail(signUpDto.email);

    if (existingUser) throw new ConflictException('User already exists');

    const newUser = await this.userService.createUser(signUpDto);

    return newUser;
  }
}
