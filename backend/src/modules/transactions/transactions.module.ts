import { Global, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Global()
@Module({
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
