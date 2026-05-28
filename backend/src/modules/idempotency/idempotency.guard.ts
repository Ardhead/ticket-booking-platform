import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { OperationInProgressError } from '../../common/errors/app-error';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];
    const userId = request.headers['x-user-id'];

    if (!idempotencyKey || !userId) {
      return true;
    }

    const operationType = `${context.getClass().name}.${context.getHandler().name}`;
    const requestHash = JSON.stringify(request.body);

    const result = await this.idempotencyService.begin(operationType, idempotencyKey, userId, requestHash);

    if (result.status === 'completed') {
      request.idempotencyResult = result.data;
      request.idempotencyCached = true;
    } else if (result.status === 'in_progress') {
      throw new OperationInProgressError();
    }

    request.idempotencyKey = idempotencyKey;
    request.idempotencyOperationType = operationType;
    return true;
  }
}
