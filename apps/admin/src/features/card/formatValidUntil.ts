import { formatScheduleDate } from '@yoga-sof/core';

export const formatValidUntil = (validUntil: string): string =>
  formatScheduleDate(new Date(`${validUntil}T12:00:00Z`));
