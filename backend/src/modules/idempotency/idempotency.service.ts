import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class IdempotencyService {
  constructor(private readonly tx: TransactionsService) {}

  async begin(
    operationType: string,
    idempotencyKey: string,
    userId: string,
    requestHash: string,
  ): Promise<{ status: 'new' | 'completed' | 'in_progress'; data?: any }> {
    const inserted = await this.tx.rawQuery<{ status: number }[]>(
      `INSERT INTO operations (id, operation_type, idempotency_key, user_id, request_hash, status)
       VALUES (gen_random_uuid(), $1, $2, $3::uuid, $4, 0)
       ON CONFLICT (operation_type, idempotency_key) DO NOTHING
       RETURNING status`,
      [operationType, idempotencyKey, userId, requestHash],
    );

    if (inserted.length > 0) {
      return { status: 'new' };
    }

    const existing = await this.tx.rawQuery<{ status: number; result: any }[]>(
      `SELECT status, result FROM operations WHERE operation_type = $1 AND idempotency_key = $2`,
      [operationType, idempotencyKey],
    );

    if (existing.length === 0) {
      return { status: 'new' };
    }

    const record = existing[0];
    if (record.status === 0) {
      return { status: 'in_progress' };
    }
    if (record.status === 1) {
      return { status: 'completed', data: record.result };
    }

    await this.tx.rawExecute(
      `UPDATE operations SET status = 0 WHERE operation_type = $1 AND idempotency_key = $2`,
      [operationType, idempotencyKey],
    );
    return { status: 'new' };
  }

  async complete(operationType: string, idempotencyKey: string, result: any): Promise<void> {
    await this.tx.rawExecute(
      `UPDATE operations SET status = 1, result = $1::jsonb WHERE operation_type = $2 AND idempotency_key = $3`,
      [JSON.stringify(result), operationType, idempotencyKey],
    );
  }

  async completeInTx(client: any, operationType: string, idempotencyKey: string, result: any): Promise<void> {
    await client.$executeRawUnsafe(
      `UPDATE operations SET status = 1, result = $1::jsonb WHERE operation_type = $2 AND idempotency_key = $3`,
      JSON.stringify(result),
      operationType,
      idempotencyKey,
    );
  }

  async fail(operationType: string, idempotencyKey: string): Promise<void> {
    await this.tx.rawExecute(
      `UPDATE operations SET status = 2 WHERE operation_type = $1 AND idempotency_key = $2`,
      [operationType, idempotencyKey],
    );
  }
}
