export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class SeatNotAvailableError extends AppError {
  constructor(seatId?: string) {
    super(
      'SEAT_NOT_AVAILABLE',
      seatId ? `Seat ${seatId} is not available` : 'One or more seats are not available',
      409,
    );
  }
}

export class OperationInProgressError extends AppError {
  constructor() {
    super('OPERATION_IN_PROGRESS', 'Operation is already in progress', 409);
  }
}

export class PaymentNotFoundError extends AppError {
  constructor(providerRef: string) {
    super('PAYMENT_NOT_FOUND', `Payment ${providerRef} not found`, 404);
  }
}
