import { describe, expect, it } from 'vitest';

import { assertConflict, assertFound, assertInput, assertState, ServiceError } from '../errors';

const httpStatusOf = (assertion: () => void): number => {
  try {
    assertion();
    expect.unreachable();
  } catch (error) {
    expect(error).toBeInstanceOf(ServiceError);
    return (error as ServiceError).httpStatus;
  }
};

describe('assertions', () => {
  it('does nothing when the condition holds', () => {
    expect(() => assertFound(true, 'Jamais levé')).not.toThrow();
    expect(() => assertConflict(true, 'Jamais levé')).not.toThrow();
    expect(() => assertInput(true, 'Jamais levé')).not.toThrow();
    expect(() => assertState(true, 'Jamais levé')).not.toThrow();
  });

  it('throws a ServiceError with the given message otherwise', () => {
    expect(httpStatusOf(() => assertFound(false, 'La séance est introuvable'))).toBe(404);
    expect(httpStatusOf(() => assertConflict(false, 'Séance complète'))).toBe(409);
    expect(httpStatusOf(() => assertInput(false, 'Paramètre invalide'))).toBe(400);
    expect(httpStatusOf(() => assertState(false, 'État incohérent'))).toBe(422);
  });
});
