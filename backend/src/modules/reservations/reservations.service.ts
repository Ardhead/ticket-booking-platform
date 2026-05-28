import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { SeatsRepository } from '../seats/seats.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly tx: TransactionsService,
    private readonly seatsRepo: SeatsRepository,
  ) {}

  async reserve(userId: string, eventId: string, seatIds: string[]) {
    const result = await this.seatsRepo.reserveAvailableSeats(eventId, userId, seatIds);

    return this.tx.run(async (client) => {
      const reservation = (await client.$queryRawUnsafe(
        `INSERT INTO reservations (id, user_id, event_id, status, expires_at)
         VALUES (gen_random_uuid(), $1::uuid, $2::uuid, 0, now() + interval '10 minutes')
         RETURNING id`,
        userId,
        eventId,
      )) as { id: string }[];

      const reservationId = reservation[0].id;

      for (const seatId of seatIds) {
        await client.$executeRawUnsafe(
          `INSERT INTO reservation_seats (reservation_id, seat_id) VALUES ($1::uuid, $2::uuid)`,
          reservationId,
          seatId,
        );
      }

      await client.$executeRawUnsafe(
        `UPDATE seats SET reservation_id = $1::uuid WHERE id = ANY($2::uuid[])`,
        reservationId,
        seatIds,
      );

      return { reservationId, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    });
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
