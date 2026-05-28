import { Controller, Post, Body, UseGuards, UseInterceptors, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { IdempotencyGuard } from '../idempotency/idempotency.guard';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(IdempotencyGuard)
  @UseInterceptors(IdempotencyInterceptor)
  async initiate(@Body() dto: { reservationId: string; amount: number }) {
    return this.paymentsService.initiate(dto.reservationId, dto.amount);
  }

  @Post('webhook')
  async webhook(@Body() dto: { providerRef: string }, @Res() res: Response) {
    const result = await this.paymentsService.confirmWebhook(dto.providerRef);
    return res.status(201).json(result);
  }
}
