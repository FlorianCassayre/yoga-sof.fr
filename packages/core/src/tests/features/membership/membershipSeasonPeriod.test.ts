import { describe, expect, it } from 'vitest';

import { membershipSeasonPeriod } from '../../../features/membership/membershipSeasonPeriod';

describe('membershipSeasonPeriod', () => {
  it('spans one year from the first of the season month', () => {
    expect(membershipSeasonPeriod({ year: 2026, month: 9 })).toEqual({
      startsAt: '2026-09-01',
      endsAt: '2027-08-31',
    });
  });

  it('ends the day before the anniversary', () => {
    expect(membershipSeasonPeriod({ year: 2026, month: 1 })).toEqual({
      startsAt: '2026-01-01',
      endsAt: '2026-12-31',
    });
  });

  it('handles February', () => {
    expect(membershipSeasonPeriod({ year: 2027, month: 2 })).toEqual({
      startsAt: '2027-02-01',
      endsAt: '2028-01-31',
    });
  });
});
