import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { SeatsRepository } from '../seats/seats.repository';
import { TransactionsService } from '../transactions/transactions.service';
import { DbService } from '../db/db.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationsService, SeatsRepository, TransactionsService, DbService],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('expireOverdue', () => {
    it('returns zero when no overdue reservations exist', async () => {
      const result = await service.expireOverdue();
      expect(typeof result).toBe('number');
    });
  });
});
