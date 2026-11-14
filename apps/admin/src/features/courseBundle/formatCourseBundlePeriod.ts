import { formatScheduleDate } from '@yoga-sof/core';

const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);

export const formatCourseBundlePeriod = ({
  startsAt,
  endsAt,
}: {
  startsAt: Date | null;
  endsAt: Date | null;
}): string | null =>
  startsAt === null || endsAt === null
    ? null
    : `Du ${lowerFirst(formatScheduleDate(startsAt))} au ${lowerFirst(formatScheduleDate(endsAt))}`;
