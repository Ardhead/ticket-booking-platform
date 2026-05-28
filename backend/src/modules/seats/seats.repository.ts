import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { SeatNotAvailableError } from '../../common/errors/app-error';

const seatsCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 10000;

@Injectable()
export class SeatsRepository {
  constructor(private readonly tx: TransactionsService) {}

  async lockAvailableSeatsInTx(client: any, eventId: string, seatIds: string[]) {
    const seats = (await client.$queryRawUnsafe(
      `SELECT id FROM seats
       WHERE event_id = $1::uuid AND id = ANY($2::uuid[]) AND status = 0
       FOR UPDATE SKIP LOCKED`,
      eventId,
      seatIds,
    )) as { id: string }[];

    if (seats.length !== seatIds.length) {
      throw new SeatNotAvailableError();
    }
  }

  async releaseExpiredHolds() {
    return this.tx.rawExecute(
      `UPDATE seats
       SET status = 0, reserved_by = NULL, reserved_until = NULL
       WHERE status = 1 AND reserved_until < now()`,
    );
  }

  async findAvailableByEvent(eventId: string) {
    const cached = seatsCache.get(eventId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const data = await this.tx.rawQuery<{ id: string; rowLabel: string; seatNumber: number; status: number }[]>(
      `SELECT id, row_label as "rowLabel", seat_number as "seatNumber", status
       FROM seats
       WHERE event_id = $1::uuid
       ORDER BY row_label, seat_number`,
      [eventId],
    );

    seatsCache.set(eventId, { data, expiry: Date.now() + CACHE_TTL_MS });
    return data;
  }

  async confirmPurchase(reservationId: string) {
    return this.tx.rawExecute(
      `UPDATE seats SET status = 2 WHERE reservation_id = $1::uuid`,
      [reservationId],
    );
  }
}
