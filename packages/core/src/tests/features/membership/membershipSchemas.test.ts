import { describe, expect, it } from 'vitest';

import {
  membershipCreateSchema,
  membershipListSchema,
} from '../../../features/membership/membershipSchemas';
import {
  membershipPriceCreateSchema,
  membershipPriceDeleteSchema,
  membershipPriceEditSchema,
} from '../../../features/membership/price/membershipPriceSchemas';

describe('membershipCreateSchema', () => {
  it('coerces wire values and flattens beneficiaries', () => {
    const result = membershipCreateSchema.parse({
      type: 'famille',
      year: '2026',
      beneficiaries: [{ id: 'u1' }, { id: 'u2' }],
    });

    expect(result).toEqual({ type: 'famille', year: 2026, userIds: ['u1', 'u2'] });
  });

  it('rejects invalid values', () => {
    expect(
      membershipCreateSchema.safeParse({
        type: 'individuelle',
        year: 2026,
        beneficiaries: [],
      }).success,
    ).toBe(false);
    expect(
      membershipCreateSchema.safeParse({
        type: 'ado',
        year: 2026,
        beneficiaries: [{ id: 'u1' }],
      }).success,
    ).toBe(false);
    expect(
      membershipCreateSchema.safeParse({
        type: 'individuelle',
        year: 'deux mille vingt-six',
        beneficiaries: [{ id: 'u1' }],
      }).success,
    ).toBe(false);
  });
});

describe('membershipListSchema', () => {
  it('rejects unknown sort fields', () => {
    expect(
      membershipListSchema.safeParse({
        page: 0,
        pageSize: 10,
        sort: [{ field: 'bogus', sort: 'asc' }],
      }).success,
    ).toBe(false);
  });
});

describe('membershipPriceCreateSchema', () => {
  it('converts euros to cents', () => {
    expect(membershipPriceCreateSchema.parse({ type: 'famille', price: '20.5' })).toEqual({
      type: 'famille',
      price: 2050,
    });
  });

  it('rejects invalid prices', () => {
    expect(membershipPriceCreateSchema.safeParse({ type: 'famille', price: '' }).success).toBe(
      false,
    );
    expect(membershipPriceCreateSchema.safeParse({ type: 'famille', price: null }).success).toBe(
      false,
    );
    expect(membershipPriceCreateSchema.safeParse({ type: 'famille', price: -1 }).success).toBe(
      false,
    );
    expect(membershipPriceCreateSchema.safeParse({ type: 'famille', price: 20.505 }).success).toBe(
      false,
    );
  });

  it('reports a readable message for a missing price', () => {
    const result = membershipPriceCreateSchema.safeParse({ type: 'famille', price: '' });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe('Le prix est requis.');
  });
});

describe('membershipPriceEditSchema', () => {
  it('requires id and version', () => {
    expect(membershipPriceEditSchema.safeParse({ type: 'famille', price: 20 }).success).toBe(false);
    expect(membershipPriceEditSchema.parse({ id: '7', version: '3', price: '20.5' })).toEqual({
      id: 7,
      version: 3,
      price: 2050,
    });
  });
});

describe('membershipPriceDeleteSchema', () => {
  it('requires id and version', () => {
    expect(membershipPriceDeleteSchema.safeParse({ id: 7 }).success).toBe(false);
    expect(membershipPriceDeleteSchema.parse({ id: '7', version: '3' })).toEqual({
      id: 7,
      version: 3,
    });
  });
});
