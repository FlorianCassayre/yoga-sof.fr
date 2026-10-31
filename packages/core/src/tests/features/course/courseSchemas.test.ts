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

  it('rejects empty inputs instead of coercing them to default values', () => {
    expect(courseCreateSchema.safeParse({ ...values, capacity: '' }).success).toBe(false);
    expect(courseCreateSchema.safeParse({ ...values, startsAt: null }).success).toBe(false);
    expect(courseCreateSchema.safeParse({ ...values, startsAt: '' }).success).toBe(false);
  });

  it('requires the séance to start and end the same day', () => {
    const nextDay = new Date(values.endsAt);
    nextDay.setDate(nextDay.getDate() + 1);

    const result = courseCreateSchema.safeParse({ ...values, endsAt: nextDay });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe(
      'La séance doit débuter et se terminer le même jour.',
    );
    expect(result.success ? null : result.error.issues[0]!.path).toEqual(['endsAt']);
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
