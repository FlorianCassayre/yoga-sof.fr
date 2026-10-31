import { describe, expect, it } from 'vitest';

import { sameDay } from '../../../util/date/sameDay';

describe('sameDay', () => {
  it('accepts two times of the same day', () => {
    expect(
      sameDay(new Date('2026-11-01T09:00:00.000Z'), new Date('2026-11-01T11:00:00.000Z')),
    ).toBe(true);
  });

  it('rejects times on different days', () => {
    expect(
      sameDay(new Date('2026-11-01T09:00:00.000Z'), new Date('2026-11-02T09:00:00.000Z')),
    ).toBe(false);
  });

  it('compares wall-clock days in the app timezone', () => {
    // 23:00 UTC is already the next day in Europe/Paris.
    expect(
      sameDay(new Date('2026-11-01T23:00:00.000Z'), new Date('2026-11-02T00:30:00.000Z')),
    ).toBe(true);
  });
});
