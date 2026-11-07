import { describe, expect, it } from 'vitest';

import { formatScheduleTimeRange } from '../../../util/date/dateTimeFormatter';

describe('formatScheduleTimeRange', () => {
  it('joins the two times with à', () => {
    expect(
      formatScheduleTimeRange(new Date('2026-11-03T14:00:00Z'), new Date('2026-11-03T15:30:00Z')),
    ).toBe('15h00 à 16h30');
  });
});
