import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly tx: TransactionsService) {}

  async initiate(reservationId: string, amount: number) {
    return this.tx.run(async (client) => {
      const payment = (await client.$queryRawUnsafe(
        `INSERT INTO payments (id, reservation_id, status, amount)
         VALUES (gen_random_uuid(), $1::uuid, 0, $2)
         RETURNING id`,
        reservationId,
        amount,
      )) as { id: string }[];

      return { paymentId: payment[0].id };
    });
  }

  async confirmWebhook(providerRef: string) {
    return this.tx.run(async (client) => {
      const payment = (await client.$queryRawUnsafe(
        `UPDATE payments SET status = 1 WHERE provider_ref = $1 RETURNING id, reservation_id`,
        providerRef,
      )) as { id: string; reservationId: string }[];

      if (payment.length === 0) return null;

      const { reservationId } = payment[0];

      await client.$executeRawUnsafe(
        `UPDATE reservations SET status = 2 WHERE id = $1::uuid`,
        reservationId,
      );

      await client.$executeRawUnsafe(
        `UPDATE seats SET status = 2 WHERE reservation_id = $1::uuid`,
        reservationId,
      );

      return payment[0];
    });
  }
}
