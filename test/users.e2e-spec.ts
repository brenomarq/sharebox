import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/entities/user.entity';
import { Item } from 'src/items/entities/item.entity';

describe('Users E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,

        // Banco em memória para testes
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Item],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Populando usuários no banco
    const repo = moduleFixture.get('UserRepository');
    await repo.save([
      {
        email: 'user1@example.com',
        password: 'hashed',
        role: 'user',
      },
      {
        email: 'user2@example.com',
        password: 'hashed',
        role: 'admin',
      },
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  // GET /users/all
  it('GET /users/all → deve retornar todos os usuários', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/all')
      .expect(200);

    expect(res.body.length).toBe(2);

    expect(res.body[0]).toHaveProperty('email');
    expect(res.body[0]).not.toHaveProperty('password');
  });

  // GET /users/:id
  it('GET /users/:id → deve retornar um usuário específico', async () => {
    const res = await request(app.getHttpServer()).get('/users/1').expect(200);

    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('email', 'user1@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /users/:id → deve retornar 404 caso não exista', async () => {
    await request(app.getHttpServer()).get('/users/999').expect(404);
  });

  it('POST /users/points/add/user/:id → deve aumentar a pontuação', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/points/add/user/1')
      .send({
        points: 50,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('score', 150);
  });
});
