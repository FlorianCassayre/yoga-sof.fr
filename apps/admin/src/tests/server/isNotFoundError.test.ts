import { describe, expect, it } from 'vitest';

import { isNotFoundError } from '../../server/isNotFoundError';

describe('isNotFoundError', () => {
  it('recognizes an error shaped by the tRPC error formatter', () => {
    expect(isNotFoundError({ data: { serviceError: true } })).toBe(true);
  });

  it('recognizes a tRPC NOT_FOUND error', () => {
    expect(isNotFoundError({ data: { code: 'NOT_FOUND' } })).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isNotFoundError(null)).toBe(false);
    expect(isNotFoundError(undefined)).toBe(false);
    expect(isNotFoundError(new Error('boom'))).toBe(false);
    expect(isNotFoundError({ data: { code: 'BAD_REQUEST' } })).toBe(false);
    expect(isNotFoundError({ data: { code: 'INTERNAL_SERVER_ERROR' } })).toBe(false);
  });
});
