import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findOneBy({ email });
  }

  async createUser(signUserDto: SignUpDto) {
    const newUser = this.repository.create(signUserDto);
    return await this.repository.save(newUser);
  }
}
