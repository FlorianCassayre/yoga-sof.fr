'use client';

import { Alert, Box } from '@mui/material';
import { EventCalendar } from '@mui/x-scheduler/event-calendar';
import type { SchedulerEvent } from '@mui/x-scheduler/models';
import { keepPreviousData } from '@tanstack/react-query';
import { APP_TIMEZONE, appLocale, appLocaleTag, COURSE_TYPE_LABELS } from '@yoga-sof/core';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { api } from '../../../server/api';
import { CourseParticipantsSection } from './CourseParticipantsSection';
import { courseResources } from './courseResources';

const PAGE_SIZE = 100;

const appTimezoneDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat(appLocaleTag, {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(read('year')),
    month: Number(read('month')) - 1,
    day: Number(read('day')),
  };
};

export const CourseCalendar = () => {
  const coursesQuery = api.course.list.useQuery(
    { page: 0, pageSize: PAGE_SIZE, sort: [{ field: 'startsAt', sort: 'asc' }] },
    { placeholderData: keepPreviousData },
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [openCourseId, setOpenCourseId] = useState<number | null>(null);
  const [participantsContainer, setParticipantsContainer] = useState<HTMLElement | null>(null);
  const courses = coursesQuery.data?.rows;

  // The mini calendar has no native event markers; match its day buttons
  // against the course days (same 'PPPP' fr label the scheduler uses) and flag
  // them, re-applying whenever the scheduler re-renders its cells.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !courses) {
      return;
    }

    const eventLabels = new Set(
      courses.map((course) => {
        const parts = appTimezoneDateParts(course.startsAt);

        return format(new Date(parts.year, parts.month, parts.day, 12), 'PPPP', {
          locale: appLocale,
        });
      }),
    );
    const markDays = () => {
      container
        .querySelectorAll<HTMLElement>('.MuiEventCalendar-miniCalendarDayButton')
        .forEach((button) => {
          const label = button.getAttribute('aria-label');
          button.toggleAttribute('data-has-events', label !== null && eventLabels.has(label));
        });
    };

    markDays();
    const observer = new MutationObserver(markDays);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [courses]);

  // Mounts the portal target the participants render into, at the end of the
  // dialog content, and keeps it in sync with the dialog lifecycle (the dialog
  // portals to the document body, hence the body-wide observation).
  useEffect(() => {
    const syncPortal = () => {
      const content = document.querySelector('.MuiEventCalendar-eventDialogReadonlyContent');
      if (!content) {
        setParticipantsContainer(null);

        return;
      }
      let target = content.querySelector<HTMLElement>('[data-course-participants]');
      if (!target) {
        target = document.createElement('div');
        target.setAttribute('data-course-participants', '');
        content.appendChild(target);
      }
      setParticipantsContainer(target);
    };

    syncPortal();
    const observer = new MutationObserver(syncPortal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (coursesQuery.error) {
    return (
      <Alert severity="error">
        {coursesQuery.error instanceof Error
          ? coursesQuery.error.message
          : 'Une erreur est survenue.'}
      </Alert>
    );
  }

  const events: SchedulerEvent[] = (courses ?? []).map((course) => ({
    id: course.id,
    title: COURSE_TYPE_LABELS[course.type],
    start: course.startsAt.toISOString(),
    end: course.endsAt.toISOString(),
    resource: course.type,
  }));

  return (
    <Box ref={containerRef} sx={{ height: 600, width: '100%' }}>
      <EventCalendar
        events={events}
        resources={courseResources}
        readOnly
        defaultView="week"
        displayTimezone={APP_TIMEZONE}
        defaultPreferences={{ ampm: false, weekStartsOn: 1 }}
        preferencesMenuConfig={false}
        onEventEditingStart={(occurrence) => {
          const course = courses?.find((item) => item.id === occurrence.id);
          setOpenCourseId(course?.id ?? null);
        }}
      />
      {participantsContainer &&
        createPortal(<CourseParticipantsSection courseId={openCourseId} />, participantsContainer)}
    </Box>
  );
};
