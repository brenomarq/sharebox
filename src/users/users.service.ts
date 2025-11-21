import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async createUser(signUserDto: SignUpDto): Promise<User> {
    const hashedPassword: string = await hash(signUserDto.password, 10);

    const newUser = this.repository.create({
      ...signUserDto,
      password: hashedPassword,
    });

    return await this.repository.save(newUser);
  }

  async findAllUsers(): Promise<User[]> {
    return await this.repository.find({
      select: ['id', 'email', 'role', 'createdAt'],
    });
  }

  async findUserById(userId: number): Promise<User> {
    const existingUser = await this.repository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'role', 'score'],
    });

    if (!existingUser) throw new NotFoundException('User does not exist');

    return existingUser;
  }

  async increasePoints(userId: number, points: number) {
    const user = await this.findUserById(userId);

    Object.assign(user, { score: user.score + points });

    return this.repository.save(user);
  }
}
