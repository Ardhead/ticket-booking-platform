import { Test, TestingModule } from '@nestjs/testing';
import { SeatsRepository } from './seats.repository';
import { TransactionsService } from '../transactions/transactions.service';
import { DbService } from '../db/db.service';

describe('SeatsRepository', () => {
  let repo: SeatsRepository;
  let tx: TransactionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeatsRepository, TransactionsService, DbService],
    }).compile();

    repo = module.get<SeatsRepository>(SeatsRepository);
    tx = module.get<TransactionsService>(TransactionsService);
  });

  describe('findAvailableByEvent', () => {
    it('returns empty list for non-existent event', async () => {
      const seats = await repo.findAvailableByEvent('00000000-0000-0000-0000-000000000000');
      expect(seats).toEqual([]);
    });
  });

  describe('releaseExpiredHolds', () => {
    it('runs without error', async () => {
      const result = await repo.releaseExpiredHolds();
      expect(typeof result).toBe('number');
    });
  });
});
