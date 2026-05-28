import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly db: DbService) {}

  async run<T>(fn: (client: any) => Promise<T>): Promise<T> {
    return this.db.$transaction(fn);
  }

  async rawQuery<T>(query: string, params?: any[]): Promise<T> {
    return this.db.$queryRawUnsafe<T>(query, ...(params || []));
  }

  async rawExecute(query: string, params?: any[]): Promise<number> {
    const result = await this.db.$executeRawUnsafe(query, ...(params || []));
    return result;
  }
}
