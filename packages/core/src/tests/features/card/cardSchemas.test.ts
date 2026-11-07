import { describe, expect, it } from 'vitest';

import {
  cardCreateSchema,
  cardEditSchema,
  cardListSchema,
} from '../../../features/card/cardSchemas';
import {
  cardTemplateCreateSchema,
  cardTemplateEditSchema,
} from '../../../features/card/template/cardTemplateSchemas';

describe('cardCreateSchema', () => {
  it('coerces wire values and flattens holder and template', () => {
    const result = cardCreateSchema.parse({
      holder: { id: 'u1' },
      template: { id: '3' },
    });

    expect(result).toEqual({ userId: 'u1', templateId: 3 });
  });

  it('requires a holder and a template', () => {
    expect(cardCreateSchema.safeParse({ template: { id: 3 } }).success).toBe(false);
    expect(cardCreateSchema.safeParse({ holder: { id: 'u1' } }).success).toBe(false);
  });
});

describe('cardEditSchema', () => {
  it('coerces wire values', () => {
    expect(cardEditSchema.parse({ id: '5', version: '2', validUntil: '2027-11-06' })).toEqual({
      id: 5,
      version: 2,
      validUntil: '2027-11-06',
    });
  });

  it('rejects an invalid date', () => {
    expect(cardEditSchema.safeParse({ id: 5, version: 2, validUntil: '06/11/2027' }).success).toBe(
      false,
    );
  });
});

describe('cardListSchema', () => {
  it('rejects unknown sort fields', () => {
    expect(
      cardListSchema.safeParse({ page: 0, pageSize: 10, sort: [{ field: 'bogus', sort: 'asc' }] })
        .success,
    ).toBe(false);
  });
});

describe('cardTemplateCreateSchema', () => {
  it('converts euros to cents and coerces the count', () => {
    expect(cardTemplateCreateSchema.parse({ type: 'adulte', price: '20.5', count: '10' })).toEqual({
      type: 'adulte',
      price: 2050,
      count: 10,
    });
  });

  it('rejects non-positive counts', () => {
    expect(
      cardTemplateCreateSchema.safeParse({ type: 'adulte', price: 20, count: 0 }).success,
    ).toBe(false);
  });
});

describe('cardTemplateEditSchema', () => {
  it('requires id and version', () => {
    expect(cardTemplateEditSchema.safeParse({ count: 10 }).success).toBe(false);
    expect(cardTemplateEditSchema.parse({ id: '7', version: '3', count: '10' })).toEqual({
      id: 7,
      version: 3,
      count: 10,
    });
  });
});
