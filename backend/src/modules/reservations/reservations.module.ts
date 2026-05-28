import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { SeatsModule } from '../seats/seats.module';
import { ExpirationWorker } from './expiration.worker';

@Module({
  imports: [SeatsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ExpirationWorker],
  exports: [ReservationsService],
})
export class ReservationsModule {}
