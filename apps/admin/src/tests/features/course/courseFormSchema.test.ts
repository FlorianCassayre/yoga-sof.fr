import { describe, expect, it } from 'vitest';

import { courseFormSchema } from '../../../features/course/courseFormSchema';

const validValues = {
  date: new Date(2026, 10, 9),
  startTime: new Date(2026, 0, 1, 9, 30),
  endTime: new Date(2026, 0, 1, 11, 0),
  capacity: '10',
  visibility: 'public',
  internalNotes: '',
} as const;

describe('courseFormSchema', () => {
  it('combines the date and the two times', () => {
    const result = courseFormSchema.parse(validValues);

    expect(result.startsAt).toEqual(new Date(2026, 10, 9, 9, 30));
    expect(result.endsAt).toEqual(new Date(2026, 10, 9, 11, 0));
    expect(result.capacity).toBe(10);
    expect(result.visibility).toBe('public');
    expect(result.internalNotes).toBe('');
  });

  it('rejects a missing date', () => {
    const result = courseFormSchema.safeParse({ ...validValues, date: null });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['date']);
    }
  });

  it('rejects a missing start time', () => {
    const result = courseFormSchema.safeParse({ ...validValues, startTime: null });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['startTime']);
    }
  });

  it('rejects an end time before the start time', () => {
    const result = courseFormSchema.safeParse({
      ...validValues,
      startTime: new Date(2026, 0, 1, 11, 0),
      endTime: new Date(2026, 0, 1, 9, 30),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['endTime']);
    }
  });

  it('rejects an empty capacity', () => {
    const result = courseFormSchema.safeParse({ ...validValues, capacity: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['capacity']);
    }
  });
});
