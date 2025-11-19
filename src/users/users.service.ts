import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { hash } from 'bcrypt';

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
    const hashedPassword: string = await hash(signUserDto.password, 10);

    const newUser = this.repository.create({
      ...signUserDto,
      password: hashedPassword,
    });

    return await this.repository.save(newUser);
  }
}
