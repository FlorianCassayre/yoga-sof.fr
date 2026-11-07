import type { EventCalendar } from '@mui/x-scheduler/event-calendar';
import type { ComponentProps } from 'react';

export type CalendarView = NonNullable<ComponentProps<typeof EventCalendar>['view']>;
