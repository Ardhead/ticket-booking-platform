import { Controller, Post, Body, Headers, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';
import { ReservationsService } from './reservations.service';
import { IdempotencyGuard } from '../idempotency/idempotency.guard';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';

class CreateReservationDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  seatIds!: string[];
}

@Controller('api/reservations')
@UseGuards(IdempotencyGuard)
@UseInterceptors(IdempotencyInterceptor)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async reserve(
    @Body() dto: CreateReservationDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-event-id') eventId: string,
    @Req() req: Request,
  ) {
    const idempotencyOpts = (req as any).idempotencyKey
      ? { operationType: (req as any).idempotencyOperationType, idempotencyKey: (req as any).idempotencyKey }
      : undefined;
    return this.reservationsService.reserve(userId, eventId, dto.seatIds, idempotencyOpts);
  }
}
