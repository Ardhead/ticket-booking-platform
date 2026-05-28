import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { DbModule } from './modules/db/db.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { LockingModule } from './modules/locking/locking.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { EventsModule } from './modules/events/events.module';
import { SeatsModule } from './modules/seats/seats.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { OperationsModule } from './modules/operations/operations.module';
import { GlobalExceptionFilter } from './common/errors/exception.filter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DbModule,
    IdempotencyModule,
    LockingModule,
    TransactionsModule,
    EventsModule,
    SeatsModule,
    ReservationsModule,
    PaymentsModule,
    OperationsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
