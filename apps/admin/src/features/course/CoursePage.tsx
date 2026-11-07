'use client';

import { Alert, Button, Stack, Typography } from '@mui/material';
import { skipToken } from '@tanstack/react-query';
import {
  attendanceOpensAt,
  COURSE_TYPE_LABELS,
  formatScheduleDate,
  formatScheduleTimeRange,
} from '@yoga-sof/core';
import { CalendarPlus, ClipboardList, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import type { PageAction, PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { useHasPermission } from '../user/useHasPermission';
import { CourseIcon } from './CourseIcon';
import { VisibilityChip } from './visibility/VisibilityChip';

interface CoursePageProps {
  id: string;
}

export const CoursePage = ({ id }: CoursePageProps) => {
  const course = api.course.get.useQuery({ id });
  const [attendanceMode, setAttendanceMode] = useState(false);
  const canManage = useHasPermission('manageData');

  const pendingPresence = api.registration.pendingPresence.useQuery(
    course.data ? { courseId: course.data.id } : skipToken,
  );

  if (course.isPending) {
    return null;
  }

  if (isNotFoundError(course.error)) {
    notFound();
  }

  if (!course.data) {
    return null;
  }

  const row = course.data;
  const callOpen = new Date() >= attendanceOpensAt(row.startsAt);
  const pendingCount = pendingPresence.data?.pending ?? 0;
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/seances/${id}/edition` },
            {
              label: 'Inscrire des utilisateurs',
              icon: CalendarPlus,
              href: `/inscriptions/creation?courseId=${id}`,
              fab: true,
            },
            {
              label: attendanceMode ? "Arrêter l'appel" : 'Faire l’appel',
              icon: ClipboardList,
              onClick: () => setAttendanceMode(!attendanceMode),
              disabled: !attendanceMode && !callOpen,
            },
          ] satisfies PageAction[],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseIcon} title="Séance" actions={actions}>
      <Stack spacing={3}>
        {attendanceMode ? (
          <Alert
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={() => setAttendanceMode(false)}
              >
                Arrêter l'appel
              </Button>
            }
          >
            Vous êtes en train de faire l'appel de cette séance.
          </Alert>
        ) : (
          canManage &&
          callOpen &&
          pendingCount > 0 && (
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={() => setAttendanceMode(true)}
                >
                  Faire l'appel
                </Button>
              }
            >
              L'appel est ouvert et des présences restent à renseigner.
            </Alert>
          )
        )}
        <RecordDetails
          entries={[
            { label: 'Type', value: COURSE_TYPE_LABELS[row.type] },
            { label: 'Date', value: formatScheduleDate(row.startsAt) },
            {
              label: 'Horaires',
              value: formatScheduleTimeRange(row.startsAt, row.endsAt),
            },
            { label: 'Capacité', value: row.capacity },
            { label: 'Inscrits', value: row.registeredCount },
            {
              label: 'Visibilité',
              value: <VisibilityChip visibility={row.visibility} size="small" />,
            },
            ...(row.internalNotes.length > 0 ? [{ label: 'Notes', value: row.internalNotes }] : []),
          ]}
        />
        <Stack spacing={2}>
          <Typography variant="h6">Inscriptions</Typography>
          <CourseUserRegistrationGrid courseId={row.id} attendanceMode={attendanceMode} />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Historique</Typography>
          <CourseUserRegistrationEventGrid courseId={row.id} />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
