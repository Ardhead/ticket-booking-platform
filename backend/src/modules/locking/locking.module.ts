import { Global, Module } from '@nestjs/common';
import { LockingService } from './locking.service';

@Global()
@Module({
  providers: [LockingService],
  exports: [LockingService],
})
export class LockingModule {}
