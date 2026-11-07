import { describe, expect, it } from 'vitest';

import { calendarSettingUpdateSchema } from '../../../features/calendar/settings/calendarSettingSchemas';

const values = {
  dayStartsAt: '09:00',
  dayEndsAt: '21:00',
};

describe('calendarSettingUpdateSchema', () => {
  it('accepts whole-hour times', () => {
    const result = calendarSettingUpdateSchema.parse(values);

    expect(result.dayStartsAt).toBe('09:00:00');
    expect(result.dayEndsAt).toBe('21:00:00');
  });

  it('rejects fractional hours and out-of-range times', () => {
    expect(calendarSettingUpdateSchema.safeParse({ ...values, dayStartsAt: '09:30' }).success).toBe(
      false,
    );
    expect(calendarSettingUpdateSchema.safeParse({ ...values, dayEndsAt: '24:00' }).success).toBe(
      false,
    );
    expect(calendarSettingUpdateSchema.safeParse({ ...values, dayStartsAt: '' }).success).toBe(
      false,
    );
  });
});
