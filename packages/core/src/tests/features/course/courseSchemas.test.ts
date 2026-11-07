import { describe, expect, it } from 'vitest';

import {
  courseBatchCreateSchema,
  courseCalendarListSchema,
  courseEditSchema,
} from '../../../features/course/courseSchemas';

const values = {
  type: 'adulte',
  startsAt: new Date('2026-11-01T09:00:00.000Z'),
  endsAt: new Date('2026-11-01T11:00:00.000Z'),
  capacity: '10',
  visibility: 'public',
  internalNotes: '',
};

describe('courseEditSchema', () => {
  it('coerces wire values and requires id and version', () => {
    const result = courseEditSchema.parse({ ...values, id: '7', version: '3' });

    expect(result.capacity).toBe(10);
    expect(result.startsAt).toEqual(values.startsAt);
    expect(result.id).toBe(7);
    expect(result.version).toBe(3);
  });

  it('rejects missing id and version', () => {
    expect(courseEditSchema.safeParse(values).success).toBe(false);
  });

  it('requires the séance to start and end the same day', () => {
    const nextDay = new Date(values.endsAt);
    nextDay.setDate(nextDay.getDate() + 1);

    const result = courseEditSchema.safeParse({ ...values, id: 7, version: 1, endsAt: nextDay });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe(
      'La séance doit débuter et se terminer le même jour.',
    );
    expect(result.success ? null : result.error.issues[0]!.path).toEqual(['endsAt']);
  });

  it('rejects invalid values', () => {
    expect(courseEditSchema.safeParse({ ...values, id: 7, version: 1, type: 'ado' }).success).toBe(
      false,
    );
    expect(
      courseEditSchema.safeParse({ ...values, id: 7, version: 1, capacity: 'dix' }).success,
    ).toBe(false);
  });
});

describe('courseCalendarListSchema', () => {
  const range = {
    start: new Date('2026-11-02T09:00:00.000Z'),
    end: new Date('2026-11-09T09:00:00.000Z'),
  };

  it('accepts a valid range', () => {
    expect(courseCalendarListSchema.parse(range)).toEqual(range);
  });

  it('accepts the widest month grid', () => {
    const monthGrid = {
      start: new Date('2026-10-25T23:00:00.000Z'),
      end: new Date('2026-12-06T23:00:00.000Z'),
    };

    expect(courseCalendarListSchema.safeParse(monthGrid).success).toBe(true);
  });

  it('rejects an inverted range', () => {
    const result = courseCalendarListSchema.safeParse({ ...range, end: range.start });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe(
      'La plage de dates est invalide.',
    );
  });

  it('rejects an oversized range', () => {
    const end = new Date(range.start);
    end.setDate(end.getDate() + 44);

    const result = courseCalendarListSchema.safeParse({ ...range, end });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe(
      'La plage de dates demandée est trop grande.',
    );
  });
});

describe('courseBatchCreateSchema', () => {
  const batch = {
    visibility: 'public',
    templates: [
      { weekday: 1, type: 'adulte', startTime: '09:00', endTime: '11:00', capacity: '10' },
    ],
    weeks: ['2026-11-09'],
  };

  it('coerces wire values', () => {
    const result = courseBatchCreateSchema.parse(batch);

    expect(result.templates[0]!.capacity).toBe(10);
    expect(result.weeks).toEqual(['2026-11-09']);
  });

  it('rejects an inverted time range', () => {
    const result = courseBatchCreateSchema.safeParse({
      ...batch,
      templates: [{ ...batch.templates[0]!, endTime: '09:00' }],
    });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]!.message).toBe(
      "L'heure de fin doit être postérieure à l'heure de début.",
    );
    expect(result.success ? null : result.error.issues[0]!.path).toEqual([
      'templates',
      0,
      'endTime',
    ]);
  });

  it('accepts consecutive templates', () => {
    const result = courseBatchCreateSchema.safeParse({
      ...batch,
      templates: [
        batch.templates[0]!,
        { weekday: 1, type: 'adulte', startTime: '11:00', endTime: '13:00', capacity: 10 },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(courseBatchCreateSchema.safeParse({ ...batch, templates: [] }).success).toBe(true);
    expect(
      courseBatchCreateSchema.safeParse({
        ...batch,
        templates: [{ ...batch.templates[0]!, weekday: 7 }],
      }).success,
    ).toBe(false);
    expect(
      courseBatchCreateSchema.safeParse({
        ...batch,
        templates: [{ ...batch.templates[0]!, startTime: '9:00' }],
      }).success,
    ).toBe(false);
    expect(courseBatchCreateSchema.safeParse({ ...batch, weeks: ['09-11-2026'] }).success).toBe(
      false,
    );
    expect(courseBatchCreateSchema.safeParse({ ...batch, visibility: 'prive' }).success).toBe(
      false,
    );
  });
});
