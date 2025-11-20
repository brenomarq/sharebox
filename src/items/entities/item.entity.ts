import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  available: boolean;

  @ManyToOne(() => User, (user) => user.items, { nullable: false })
  owner: User;

  @Column()
  ownerId: number;

  @Column({ default: new Date().toISOString() })
  createdAt: string;
}
