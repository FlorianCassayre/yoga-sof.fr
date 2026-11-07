'use client';

import { Stack, Typography } from '@mui/material';
import { COURSE_TYPE_LABELS, formatScheduleDate, formatScheduleTimeRange } from '@yoga-sof/core';
import { CalendarPlus, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { CourseIcon } from './CourseIcon';
import { VisibilityChip } from './visibility/VisibilityChip';

interface CoursePageProps {
  id: string;
}

export const CoursePage = ({ id }: CoursePageProps) => {
  const course = api.course.get.useQuery({ id });

  if (course.isPending) {
    return null;
  }

  if (isNotFoundError(course.error)) {
    notFound();
  }

  if (!course.data) {
    return null;
  }

  return (
    <PageLayout
      icon={CourseIcon}
      title="Séance"
      actions={[
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/seances/${id}/edition` },
            {
              label: 'Inscrire des utilisateurs',
              icon: CalendarPlus,
              href: `/inscriptions/creation/${id}`,
              fab: true,
            },
          ],
        },
      ]}
    >
      <Stack spacing={3}>
        <RecordDetails
          entries={[
            { label: 'Type', value: COURSE_TYPE_LABELS[course.data.type] },
            { label: 'Date', value: formatScheduleDate(course.data.startsAt) },
            {
              label: 'Horaires',
              value: formatScheduleTimeRange(course.data.startsAt, course.data.endsAt),
            },
            { label: 'Capacité', value: course.data.capacity },
            { label: 'Inscrits', value: course.data.registeredCount },
            {
              label: 'Visibilité',
              value: <VisibilityChip visibility={course.data.visibility} size="small" />,
            },
            ...(course.data.internalNotes.length > 0
              ? [{ label: 'Notes', value: course.data.internalNotes }]
              : []),
          ]}
        />
        <Stack spacing={2}>
          <Typography variant="h6">Inscriptions</Typography>
          <CourseUserRegistrationGrid courseId={course.data.id} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Historique</Typography>
          <CourseUserRegistrationEventGrid courseId={course.data.id} />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
