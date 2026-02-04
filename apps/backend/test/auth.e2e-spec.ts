import 'dotenv/config';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const registerPayload = {
    email: `auth-e2e-${Date.now()}@test.com`,
    password: 'password123',
    firstName: 'E2E',
    lastName: 'User',
  };

  it('1. POST /auth/register - creates user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(registerPayload)
      .expect(HttpStatus.CREATED)
      .expect((res: { body: Record<string, unknown> }) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(registerPayload.email);
        expect(res.body.firstName).toBe(registerPayload.firstName);
        expect(res.body.lastName).toBe(registerPayload.lastName);
        expect(res.body.role).toBe('PARTICIPANT');
      });
  });

  it('2. POST /auth/login - returns tokens', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });

  describe('protected route and token flow', () => {
    let accessToken: string;
    let refreshTokenFromLogin: string;
    let refreshTokenAfterRefresh: string;

    beforeAll(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });
      const body = loginRes.body as {
        accessToken: string;
        refreshToken: string;
      };
      accessToken = body.accessToken;
      refreshTokenFromLogin = body.refreshToken;
    });

    it('3. GET /auth/admin-only with access token returns 403 (PARTICIPANT)', () => {
      return request(app.getHttpServer())
        .get('/auth/admin-only')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('4. POST /auth/refresh - returns new tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenFromLogin })
        .expect(HttpStatus.OK);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      refreshTokenAfterRefresh = (res.body as { refreshToken: string })
        .refreshToken;
    });

    it('5. POST /auth/logout - invalidates refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: refreshTokenAfterRefresh ?? '' })
        .expect(HttpStatus.OK);
    });

    it('6. POST /auth/refresh with old token after logout must fail', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: refreshTokenFromLogin });
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
