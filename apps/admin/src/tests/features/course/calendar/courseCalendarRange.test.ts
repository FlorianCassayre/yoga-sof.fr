import { describe, expect, it } from 'vitest';

import { courseCalendarRange } from '../../../../features/course/calendar/courseCalendarRange';

describe('courseCalendarRange', () => {
  it('spans the day containing the visible date', () => {
    expect(courseCalendarRange('day', new Date('2026-11-03T15:00:00.000Z'))).toEqual({
      start: new Date('2026-11-02T23:00:00.000Z'),
      end: new Date('2026-11-03T23:00:00.000Z'),
    });
  });

  it('spans the Monday-to-Sunday week', () => {
    expect(courseCalendarRange('week', new Date('2026-11-03T15:00:00.000Z'))).toEqual({
      start: new Date('2026-11-01T23:00:00.000Z'),
      end: new Date('2026-11-08T23:00:00.000Z'),
    });
  });

  it('spans the whole month grid, across a DST change', () => {
    const { start, end } = courseCalendarRange('month', new Date('2026-11-03T15:00:00.000Z'));

    expect(new Date(start).toISOString()).toBe('2026-10-25T23:00:00.000Z');
    expect(new Date(end).toISOString()).toBe('2026-12-06T23:00:00.000Z');
    expect((end.getTime() - start.getTime()) / 86400000).toBe(42);
  });

  it('spans the summer month grid', () => {
    expect(courseCalendarRange('month', new Date('2026-07-14T15:00:00.000Z'))).toEqual({
      start: new Date('2026-06-28T22:00:00.000Z'),
      end: new Date('2026-08-02T22:00:00.000Z'),
    });
  });

  it('spans the agenda horizon', () => {
    expect(courseCalendarRange('agenda', new Date('2026-11-03T15:00:00.000Z'))).toEqual({
      start: new Date('2026-11-02T23:00:00.000Z'),
      end: new Date('2026-11-14T23:00:00.000Z'),
    });
  });
});
