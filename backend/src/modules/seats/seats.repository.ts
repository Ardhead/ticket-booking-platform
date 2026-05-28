import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { SeatNotAvailableError } from '../../common/errors/app-error';

@Injectable()
export class SeatsRepository {
  constructor(private readonly tx: TransactionsService) {}

  async reserveAvailableSeats(eventId: string, userId: string, seatIds: string[]) {
    return this.tx.run(async (client) => {
      const seats = (await client.$queryRawUnsafe(
        `SELECT id FROM seats
         WHERE event_id = $1::uuid AND id = ANY($2::uuid[]) AND status = 0
         ORDER BY id
         FOR UPDATE SKIP LOCKED`,
        eventId,
        seatIds,
      )) as { id: string }[];

      if (seats.length !== seatIds.length) {
        throw new SeatNotAvailableError();
      }

      const updated = (await client.$executeRawUnsafe(
        `UPDATE seats
         SET status = 1, reserved_by = $1::uuid, reserved_until = now() + interval '10 minutes'
         WHERE id = ANY($2::uuid[])`,
        userId,
        seatIds,
      )) as number;

      return { held: updated, seatIds };
    });
  }

  async releaseExpiredHolds() {
    return this.tx.rawExecute(
      `UPDATE seats
       SET status = 0, reserved_by = NULL, reserved_until = NULL
       WHERE status = 1 AND reserved_until < now()`,
    );
  }

  async findAvailableByEvent(eventId: string) {
    return this.tx.rawQuery<{ id: string; rowLabel: string; seatNumber: number; status: number }[]>(
      `SELECT id, row_label as "rowLabel", seat_number as "seatNumber", status
       FROM seats
       WHERE event_id = $1::uuid
       ORDER BY row_label, seat_number`,
      [eventId],
    );
  }

  async confirmPurchase(reservationId: string) {
    return this.tx.rawExecute(
      `UPDATE seats SET status = 2 WHERE reservation_id = $1::uuid`,
      [reservationId],
    );
  }
}
