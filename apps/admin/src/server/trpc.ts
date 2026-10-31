import { initTRPC } from '@trpc/server';
import { ServiceError } from '@yoga-sof/core/server';
import superjson from 'superjson';

const SERVICE_ERROR_CODES: Record<
  number,
  'BAD_REQUEST' | 'CONFLICT' | 'NOT_FOUND' | 'UNPROCESSABLE_CONTENT'
> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_CONTENT',
};

export const trpc = initTRPC.create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    const { stack: _stack, ...data } = shape.data;

    if (error.cause instanceof ServiceError) {
      return {
        ...shape,
        message: error.cause.message,
        data: {
          ...data,
          code: SERVICE_ERROR_CODES[error.cause.httpStatus] ?? data.code,
          httpStatus: error.cause.httpStatus,
          serviceError: true,
        },
      };
    }

    if (error.code !== 'INTERNAL_SERVER_ERROR') {
      return { ...shape, data };
    }

    console.error(error);
    return { ...shape, message: 'Une erreur est survenue.', data };
  },
});
