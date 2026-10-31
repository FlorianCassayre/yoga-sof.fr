import type { SchedulerEventColor } from '@mui/x-scheduler/models';
import { COURSE_TYPE_LABELS, type CourseType } from '@yoga-sof/core';

const EVENT_COLORS: Record<CourseType, SchedulerEventColor> = {
  adulte: 'green',
  enfant: 'amber',
};

export const courseResources = (Object.keys(COURSE_TYPE_LABELS) as CourseType[]).map((type) => ({
  id: type,
  title: COURSE_TYPE_LABELS[type],
  eventColor: EVENT_COLORS[type],
}));
