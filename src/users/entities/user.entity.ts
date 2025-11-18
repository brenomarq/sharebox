import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'text', default: UserRole.USER })
  role: UserRole;

  @Column({ default: 100 })
  score: number;

  @Column({ default: new Date().toISOString() })
  createdAt: string;
}
