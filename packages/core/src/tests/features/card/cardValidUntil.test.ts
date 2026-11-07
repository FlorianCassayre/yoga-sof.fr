import { describe, expect, it } from 'vitest';

import { cardValidUntil } from '../../../features/card/cardValidUntil';

describe('cardValidUntil', () => {
  it('spans the given number of months from the purchase day in Paris', () => {
    expect(cardValidUntil({ purchasedAt: new Date('2026-11-07T15:00:00Z'), months: 12 })).toBe(
      '2027-11-06',
    );
  });

  it('uses the Paris calendar day, not the UTC day', () => {
    expect(cardValidUntil({ purchasedAt: new Date('2026-11-07T23:30:00Z'), months: 12 })).toBe(
      '2027-11-07',
    );
  });

  it('clamps to the last day of short months', () => {
    expect(cardValidUntil({ purchasedAt: new Date('2027-01-31T12:00:00Z'), months: 1 })).toBe(
      '2027-02-27',
    );
  });
});
