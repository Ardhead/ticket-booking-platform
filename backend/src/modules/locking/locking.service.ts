import { Injectable } from '@nestjs/common';

@Injectable()
export class LockingService {
  acquire(lockName: string, timeoutMs: number = 5000): string {
    const lockId = `${lockName}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return lockId;
  }

  release(lockId: string): void {
    return;
  }
}
