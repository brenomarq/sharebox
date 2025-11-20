import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from './items/items.module';
import { Item } from './items/entities/item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Item],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
