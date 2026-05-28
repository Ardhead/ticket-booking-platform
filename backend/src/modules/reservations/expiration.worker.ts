import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsService } from './reservations.service';

@Injectable()
export class ExpirationWorker {
  private readonly logger = new Logger(ExpirationWorker.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleExpiredReservations() {
    const count = await this.reservationsService.expireOverdue();
    if (count > 0) {
      this.logger.log(`Expired ${count} overdue reservations`);
    }
  }
}
