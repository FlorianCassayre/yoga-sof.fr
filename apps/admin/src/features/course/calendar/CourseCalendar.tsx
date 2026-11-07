'use client';

import { Alert, Backdrop, Box, CircularProgress } from '@mui/material';
import { EventCalendar } from '@mui/x-scheduler/event-calendar';
import type { SchedulerEvent } from '@mui/x-scheduler/models';
import { APP_TIMEZONE, COURSE_TYPE_LABELS } from '@yoga-sof/core';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { api } from '../../../server/api';
import type { CalendarView } from './CalendarView';
import { courseCalendarRange } from './courseCalendarRange';
import { CourseParticipantsSection } from './CourseParticipantsSection';
import { courseResources } from './courseResources';

export const CourseCalendar = () => {
  const [view, setView] = useState<CalendarView>('week');
  const [visibleDate, setVisibleDate] = useState<Date>(() => new Date());
  const viewRange = courseCalendarRange(view, visibleDate);
  const eventsQuery = api.course.calendar.useQuery(
    { start: viewRange.start, end: viewRange.end },
    { refetchOnWindowFocus: false },
  );
  const setting = api.calendarSetting.get.useQuery().data;
  const dayStartHour = setting ? Number(setting.dayStartsAt.slice(0, 2)) : 9;
  const dayEndHour = setting ? Number(setting.dayEndsAt.slice(0, 2)) : 21;
  const timeGridViewConfig = { startTime: dayStartHour, endTime: dayEndHour };
  const containerRef = useRef<HTMLDivElement>(null);
  const [openCourseId, setOpenCourseId] = useState<number | null>(null);
  const [participantsContainer, setParticipantsContainer] = useState<HTMLElement | null>(null);
  const [contentContainer, setContentContainer] = useState<HTMLElement | null>(null);
  const loading = eventsQuery.isFetching;
  // The events render only once the fetch of the current range has settled, so
  // a cached range starts empty too.
  const courses = eventsQuery.isFetching ? undefined : eventsQuery.data;

  // Tracks the events area the loading dim renders into.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const syncContent = () => {
      setContentContainer(container.querySelector<HTMLElement>('.MuiEventCalendar-content'));
    };

    syncContent();
    const observer = new MutationObserver(syncContent);
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

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

  if (eventsQuery.error) {
    return (
      <Alert severity="error">
        {eventsQuery.error instanceof Error
          ? eventsQuery.error.message
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
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        height: 600,
        width: '100%',
        ...(loading && { cursor: 'progress' }),
      }}
    >
      <EventCalendar
        events={events}
        resources={courseResources}
        readOnly
        view={view}
        onViewChange={setView}
        visibleDate={visibleDate}
        onVisibleDateChange={(date) => setVisibleDate(date)}
        displayTimezone={APP_TIMEZONE}
        viewConfig={{ day: timeGridViewConfig, week: timeGridViewConfig }}
        defaultPreferences={{ ampm: false, weekStartsOn: 1, showWeekends: false }}
        preferencesMenuConfig={false}
        onEventEditingStart={(occurrence) => {
          const course = courses?.find((item) => item.id === occurrence.id);
          setOpenCourseId(course?.id ?? null);
        }}
      />
      {contentContainer &&
        createPortal(
          <Backdrop
            open={loading}
            sx={{ position: 'absolute' }}
            slotProps={{ root: { className: 'calendar-dim' } }}
          >
            <CircularProgress />
          </Backdrop>,
          contentContainer,
        )}
      {participantsContainer &&
        createPortal(<CourseParticipantsSection courseId={openCourseId} />, participantsContainer)}
    </Box>
  );
};
