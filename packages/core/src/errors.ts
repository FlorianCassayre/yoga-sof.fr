export class ServiceError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

function assert(condition: unknown, message: string, httpStatus: number): asserts condition {
  if (!condition) {
    throw new ServiceError(message, httpStatus);
  }
}

export function assertFound(condition: unknown, message: string): asserts condition {
  assert(condition, message, 404);
}

export function assertConflict(condition: unknown, message: string): asserts condition {
  assert(condition, message, 409);
}

export function assertInput(condition: unknown, message: string): asserts condition {
  assert(condition, message, 400);
}

export function assertState(condition: unknown, message: string): asserts condition {
  assert(condition, message, 422);
}
