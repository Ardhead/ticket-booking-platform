import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/modules/db/db.service';

describe('Ticket Booking API (e2e)', () => {
  let app: INestApplication;
  let http: request.SuperTest<request.Test>;
  let eventId: string;
  let seatIds: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const db = app.get(DbService);
    await db.$executeRawUnsafe('DELETE FROM operations');
    await db.$executeRawUnsafe('DELETE FROM reservation_seats');
    await db.$executeRawUnsafe('DELETE FROM payments');
    await db.$executeRawUnsafe('DELETE FROM reservations');
    await db.$executeRawUnsafe('DELETE FROM seats');
    await db.$executeRawUnsafe('DELETE FROM events');

    http = request(app.getHttpServer()) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Events', () => {
    it('GET /api/events returns empty list initially', async () => {
      const res = await http.get('/api/events').expect(200);
      expect(res.body).toEqual([]);
    });

    it('POST /api/events creates an event', async () => {
      const res = await http.post('/api/events').send({ name: 'Concert', startsAt: '2026-07-01T20:00:00Z' }).expect(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Concert');
      eventId = res.body.id;
    });

    it('POST /api/events rejects invalid data', async () => {
      await http.post('/api/events').send({ name: '' }).expect(400);
    });

    it('GET /api/events/:id returns the event', async () => {
      const res = await http.get(`/api/events/${eventId}`).expect(200);
      expect(res.body.id).toBe(eventId);
    });

    it('GET /api/events/:id returns 404 for unknown id', async () => {
      await http.get('/api/events/00000000-0000-0000-0000-000000000000').expect(404);
    });
  });

  describe('Seats', () => {
    it('GET /api/events/:id/seats returns list of available seats', async () => {
      const res = await http.get(`/api/events/${eventId}/seats`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Reservations', () => {
    const userId = '11111111-1111-1111-1111-111111111111';

    it('POST /api/reservations rejects without seatIds', async () => {
      await http.post('/api/reservations').set('x-user-id', userId).set('x-event-id', eventId).send({}).expect(400);
    });

    it('POST /api/reservations with empty seatIds returns 400', async () => {
      await http
        .post('/api/reservations')
        .set('x-user-id', userId)
        .set('x-event-id', eventId)
        .set('x-idempotency-key', 'test-key-empty')
        .send({ seatIds: [] })
        .expect(400);
    });

    it('POST /api/reservations with invalid seat IDs returns 409', async () => {
      const res = await http
        .post('/api/reservations')
        .set('x-user-id', userId)
        .set('x-event-id', eventId)
        .set('x-idempotency-key', 'test-key-1')
        .send({ seatIds: ['00000000-0000-0000-0000-000000000000'] })
        .expect(409);
      expect(res.body.error).toBe('SEAT_NOT_AVAILABLE');
    });

    it('POST /api/reservations with same idempotency key returns cached result', async () => {
      const res1 = await http
        .post('/api/reservations')
        .set('x-user-id', userId)
        .set('x-event-id', eventId)
        .set('x-idempotency-key', 'test-key-dup')
        .send({ seatIds: ['00000000-0000-0000-0000-000000000000'] })
        .expect(409);

      const res2 = await http
        .post('/api/reservations')
        .set('x-user-id', userId)
        .set('x-event-id', eventId)
        .set('x-idempotency-key', 'test-key-dup')
        .send({ seatIds: ['00000000-0000-0000-0000-000000000000'] })
        .expect(409);
    });
  });

  describe('Payments', () => {
    it('POST /api/payments/webhook with unknown ref returns 200 null', async () => {
      const res = await http.post('/api/payments/webhook').send({ providerRef: 'unknown' }).expect(201);
      expect(res.body).toBeNull();
    });
  });
});
