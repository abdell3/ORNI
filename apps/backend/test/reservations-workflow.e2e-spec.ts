import 'dotenv/config';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface EventResponse {
  id: string;
  title: string;
  status: string;
}

interface ReservationResponse {
  id: string;
  status: string;
}

describe('Reservations Workflow (e2e)', () => {
  let app: INestApplication<App>;

  const adminCredentials = {
    email: 'admin@orni.local',
    password: 'Admin123!',
  };

  const participantCredentials = {
    email: 'participant@orni.local',
    password: 'Participant123!',
  };

  let adminToken: string;
  let participantToken: string;
  let eventId: string;
  let reservationId: string;

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

  it('1. Login Admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(adminCredentials)
      .expect(HttpStatus.OK);

    const body = res.body as LoginResponse;
    expect(body).toHaveProperty('accessToken');
    adminToken = body.accessToken;
  });

  it('2. Login Participant', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(participantCredentials)
      .expect(HttpStatus.OK);

    const body = res.body as LoginResponse;
    expect(body).toHaveProperty('accessToken');
    participantToken = body.accessToken;
  });

  it('3. Admin creates event (POST /events) - status DRAFT', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    const createEventDto = {
      title: 'E2E Workflow Event',
      description: 'Événement créé par le test E2E',
      date: futureDate.toISOString(),
      location: 'Paris',
      capacity: 50,
    };

    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createEventDto)
      .expect(HttpStatus.CREATED);

    const body = res.body as EventResponse;
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('DRAFT');
    eventId = body.id;
  });

  it('4. Admin publishes event (PATCH /events/:id/publish)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const body = res.body as EventResponse;
    expect(body.status).toBe('PUBLISHED');
  });

  it('5. Participant fetches public events list (GET /events)', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .expect(HttpStatus.OK);

    const events = res.body as EventResponse[];
    expect(Array.isArray(events)).toBe(true);
    const publishedEvent = events.find((e) => e.id === eventId);
    expect(publishedEvent).toBeDefined();
    expect(publishedEvent?.title).toBe('E2E Workflow Event');
    expect(publishedEvent?.status).toBe('PUBLISHED');
  });

  it('6. Participant creates reservation (POST /reservations)', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({ eventId })
      .expect(HttpStatus.CREATED);

    const body = res.body as ReservationResponse;
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('PENDING');
    reservationId = body.id;
  });

  it('7. Admin confirms reservation (PATCH /reservations/:id/confirm)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const body = res.body as ReservationResponse;
    expect(body.status).toBe('CONFIRMED');
  });

  it('8. Participant downloads ticket PDF (GET /reservations/:id/ticket)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservations/${reservationId}/ticket`)
      .set('Authorization', `Bearer ${participantToken}`)
      .expect(HttpStatus.OK);

    expect(res.headers['content-type']).toContain('application/pdf');
    expect(Buffer.isBuffer(res.body) || typeof res.body === 'object').toBe(
      true,
    );
  });
});
