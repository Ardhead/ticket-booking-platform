import { Controller, Get, Param } from '@nestjs/common';
import { SeatsRepository } from './seats.repository';

@Controller('api/events/:eventId/seats')
export class SeatsController {
  constructor(private readonly seatsRepo: SeatsRepository) {}

  @Get()
  async findAvailable(@Param('eventId') eventId: string) {
    return this.seatsRepo.findAvailableByEvent(eventId);
  }
}
