import { describe, expect, it } from 'vitest';

import { courseCreateSchema, courseEditSchema } from '../../../features/course/courseSchemas';

const values = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  capacity: '10',
  visibility: 'public',
  internalNotes: '',
};

describe('courseCreateSchema', () => {
  it('coerces wire values', () => {
    const result = courseCreateSchema.parse(values);

    expect(result.capacity).toBe(10);
    expect(result.startsAt).toEqual(values.startsAt);
  });

  it('rejects invalid values', () => {
    expect(courseCreateSchema.safeParse({ ...values, type: 'ado' }).success).toBe(false);
    expect(courseCreateSchema.safeParse({ ...values, capacity: 'dix' }).success).toBe(false);
  });

  it('ignores derived columns', () => {
    const result = courseCreateSchema.parse({ ...values, id: 7, version: 3, registeredCount: 9 });

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('version');
    expect(result).not.toHaveProperty('registeredCount');
  });
});

describe('courseEditSchema', () => {
  it('requires id and version', () => {
    expect(courseEditSchema.safeParse(values).success).toBe(false);
    expect(courseEditSchema.parse({ ...values, id: '7', version: '3' })).toMatchObject({
      id: 7,
      version: 3,
    });
  });
});
