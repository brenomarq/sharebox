import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/entities/user.entity';
import { Item } from 'src/items/entities/item.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        // Banco de dados em memória para os testes
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          synchronize: true,
          entities: [User, Item],
        }),

        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Habilita validação igual produção
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let accessToken: string;

  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------
  it('POST /auth/signup → deve criar um usuário', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'john@example.com',
        password: '123456',
        role: 'user',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('john@example.com');
  });

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  it('POST /auth/login → deve logar e retornar token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');

    accessToken = res.body.access_token;
  });

  // --------------------------------------------------
  // LOGIN FAIL
  // --------------------------------------------------
  it('POST /auth/login → deve falhar com credenciais inválidas', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrong-password',
      })
      .expect(401);
  });

  // --------------------------------------------------
  // ME (rota protegida)
  // --------------------------------------------------
  it('GET /auth/me → deve retornar usuário autenticado', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('sub');
  });

  it('GET /auth/me → deve falhar sem token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
