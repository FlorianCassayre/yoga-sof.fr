import {
  addDays,
  addHours,
  addMinutes,
  setMilliseconds,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subYears,
} from 'date-fns';
import { describe, expect, it } from 'vitest';

import { formatRelativeTimestamp, formatTimestamp } from '../timestamp';

const now = setMilliseconds(new Date(), 0);

describe('formatRelativeTimestamp', () => {
  it('formats past timestamps', () => {
    expect(formatRelativeTimestamp(now, now)).toBe('Il y a quelques instants');
    expect(formatRelativeTimestamp(subMinutes(now, 55), now)).toBe('Il y a 55 minutes');
    expect(formatRelativeTimestamp(subHours(now, 1), now)).toBe('Il y a 1 heure');
    expect(formatRelativeTimestamp(subHours(now, 3), now)).toBe('Il y a 3 heures');
    expect(formatRelativeTimestamp(subDays(now, 3), now)).toBe('Il y a 3 jours');
    expect(formatRelativeTimestamp(subDays(now, 1), now)).toBe('Hier');
    expect(formatRelativeTimestamp(subDays(now, 2), now)).toBe('Avant-hier');
  });

  it('formats singular past durations', () => {
    expect(formatRelativeTimestamp(subMinutes(now, 1), now)).toBe('Il y a 1 minute');
    expect(formatRelativeTimestamp(subMonths(now, 1), now)).toBe('Il y a 1 mois');
    expect(formatRelativeTimestamp(subYears(now, 1), now)).toBe('Il y a 1 année');
  });

  it('formats plural past durations', () => {
    expect(formatRelativeTimestamp(subMonths(now, 3), now)).toBe('Il y a 3 mois');
    expect(formatRelativeTimestamp(subYears(now, 2), now)).toBe('Il y a 2 années');
    expect(formatRelativeTimestamp(subDays(now, 10), now)).toBe('Il y a 10 jours');
    expect(formatRelativeTimestamp(subHours(now, 23), now)).toBe('Il y a 23 heures');
  });

  it('formats future timestamps', () => {
    expect(formatRelativeTimestamp(addMinutes(now, 5), now)).toBe('Dans 5 minutes');
    expect(formatRelativeTimestamp(addHours(now, 2), now)).toBe('Dans 2 heures');
    expect(formatRelativeTimestamp(addDays(now, 3), now)).toBe('Dans 3 jours');
  });
});

describe('formatTimestamp', () => {
  it('formats the date in the Paris timezone', () => {
    expect(formatTimestamp(new Date('2026-10-20T14:02:31.000Z'))).toBe('Le 20/10/2026 à 16:02:31');
    expect(formatTimestamp(new Date('2026-01-25T14:02:31.000Z'))).toBe('Le 25/01/2026 à 15:02:31');
  });
});
