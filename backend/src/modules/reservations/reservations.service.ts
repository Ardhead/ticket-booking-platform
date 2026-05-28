import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { SeatsRepository } from '../seats/seats.repository';
import { SeatNotAvailableError } from '../../common/errors/app-error';
import { IdempotencyService } from '../idempotency/idempotency.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly tx: TransactionsService,
    private readonly seatsRepo: SeatsRepository,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async reserve(userId: string, eventId: string, seatIds: string[], idempotencyOpts?: { operationType: string; idempotencyKey: string }) {
    const available = await this.tx.rawQuery<{ count: bigint }[]>(
      `SELECT COUNT(*)::int as count FROM seats WHERE event_id = $1::uuid AND status = 0 LIMIT 1`,
      [eventId],
    );
    if (Number(available[0].count) === 0) {
      throw new SeatNotAvailableError();
    }

    try {
      return await this.tx.run(async (client) => {
        await this.seatsRepo.lockAvailableSeatsInTx(client, eventId, seatIds);

        const reservation = (await client.$queryRawUnsafe(
          `INSERT INTO reservations (id, user_id, event_id, status, expires_at)
           VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 0, now() + interval '10 minutes')
           RETURNING id`,
          userId,
          eventId,
        )) as { id: string }[];

        const reservationId = reservation[0].id;

        const values = seatIds.map((_, i) => `($1::uuid, $${i + 2}::uuid)`).join(', ');
        await client.$executeRawUnsafe(
          `INSERT INTO reservation_seats (reservation_id, seat_id) VALUES ${values}`,
          reservationId,
          ...seatIds,
        );

        await client.$executeRawUnsafe(
          `UPDATE seats
           SET status = 1, reserved_by = $1::uuid, reservation_id = $2::uuid,
               reserved_until = now() + interval '10 minutes'
           WHERE id = ANY($3::uuid[])`,
          userId,
          reservationId,
          seatIds,
        );

        if (idempotencyOpts) {
          await this.idempotencyService.completeInTx(client, idempotencyOpts.operationType, idempotencyOpts.idempotencyKey, { reservationId });
        }

        return { reservationId, expiresAt: new Date(Date.now() + 10 * 60 * 1000), _idempotencyCompleted: true };
      });
    } catch (e) {
      if (idempotencyOpts) {
        await this.idempotencyService.fail(idempotencyOpts.operationType, idempotencyOpts.idempotencyKey);
      }
      throw e;
    }
  }

  async expireOverdue() {
    return this.tx.run(async (client) => {
      const expired = (await client.$queryRawUnsafe(
        `UPDATE reservations SET status = 1
         WHERE status = 0 AND expires_at < now()
         RETURNING id`,
      )) as { id: string }[];

      for (const res of expired) {
        await client.$executeRawUnsafe(
          `UPDATE seats SET status = 0, reserved_by = NULL, reservation_id = NULL, reserved_until = NULL
           WHERE reservation_id = $1::uuid`,
          res.id,
        );
      }

      return expired.length;
    });
  }
}
