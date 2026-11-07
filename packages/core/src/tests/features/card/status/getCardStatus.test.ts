import { describe, expect, it } from 'vitest';

import { getCardStatus } from '../../../../features/card/status/getCardStatus';

const REFERENCE = new Date('2026-11-07T15:00:00Z');

describe('getCardStatus', () => {
  it('is canceled first, regardless of the other conditions', () => {
    expect(
      getCardStatus({ canceled: true, remaining: 5, validUntil: '2027-01-01' }, REFERENCE),
    ).toBe('canceled');
    expect(
      getCardStatus({ canceled: true, remaining: 0, validUntil: '2020-01-01' }, REFERENCE),
    ).toBe('canceled');
  });

  it('is empty even when expired', () => {
    expect(
      getCardStatus({ canceled: false, remaining: 0, validUntil: '2020-01-01' }, REFERENCE),
    ).toBe('empty');
  });

  it('is expired when the validity is past', () => {
    expect(
      getCardStatus({ canceled: false, remaining: 5, validUntil: '2026-11-06' }, REFERENCE),
    ).toBe('expired');
  });

  it('is active when the validity reaches today', () => {
    expect(
      getCardStatus({ canceled: false, remaining: 5, validUntil: '2026-11-07' }, REFERENCE),
    ).toBe('active');
  });

  it('compares against the Paris calendar day', () => {
    expect(
      getCardStatus(
        { canceled: false, remaining: 5, validUntil: '2026-11-07' },
        new Date('2026-11-07T23:30:00Z'),
      ),
    ).toBe('expired');
  });
});
