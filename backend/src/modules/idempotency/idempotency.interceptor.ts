import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, from, of, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.idempotencyCached) {
      return of(request.idempotencyResult);
    }

    if (!request.idempotencyKey) {
      return next.handle();
    }

    return next.handle().pipe(
      mergeMap((result) => {
        if (result && result._idempotencyCompleted) {
          const { _idempotencyCompleted, ...clean } = result;
          return of(clean);
        }
        return from(this.idempotencyService.complete(request.idempotencyOperationType, request.idempotencyKey, result)).pipe(
          mergeMap(() => of(result)),
        );
      }),
      catchError((err) =>
        from(this.idempotencyService.fail(request.idempotencyOperationType, request.idempotencyKey)).pipe(
          mergeMap(() => throwError(() => err)),
        ),
      ),
    );
  }
}
