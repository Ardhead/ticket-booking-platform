import { Module } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { SeatsRepository } from './seats.repository';

@Module({
  controllers: [SeatsController],
  providers: [SeatsRepository],
  exports: [SeatsRepository],
})
export class SeatsModule {}
