'use client';

import { Alert, Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import {
  attendanceOpensAt,
  COURSE_TYPE_LABELS,
  formatPrice,
  formatScheduleDate,
  formatScheduleTimeRange,
} from '@yoga-sof/core';
import { Ban, CalendarPlus, ClipboardList, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { ConfirmDialog } from '../../components/dialog/ConfirmDialog';
import type { PageAction, PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseBundleLink } from '../courseBundle/CourseBundleLink';
import { CoursePresenceGrid } from '../registration/CoursePresenceGrid';
import { RegistrationEventGrid } from '../registration/RegistrationEventGrid';
import { useHasPermission } from '../user/useHasPermission';
import { CourseCounts } from './CourseCounts';
import { CourseIcon } from './CourseIcon';
import { VisibilityChip } from './visibility/VisibilityChip';

interface CoursePageProps {
  id: string;
}

export const CoursePage = ({ id }: CoursePageProps) => {
  const course = api.course.get.useQuery({ id });
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reason, setReason] = useState('');
  const canManage = useHasPermission('manageData');

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
  const pendingCount = row.pending;
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/seances/${id}/edition` },
            {
              label: 'Inscrire des utilisateurs',
              icon: CalendarPlus,
              href:
                row.courseBundleId !== null
                  ? `/inscriptions/creation?courseBundleId=${row.courseBundleId}`
                  : `/inscriptions/creation?courseId=${id}`,
              fab: true,
            },
            {
              label: attendanceMode ? "Arrêter l'appel" : 'Faire l’appel',
              icon: ClipboardList,
              onClick: () => setAttendanceMode(!attendanceMode),
              disabled: !attendanceMode && !callOpen,
            },
            ...(!row.canceled
              ? [
                  {
                    label: 'Annuler la séance',
                    icon: Ban,
                    onClick: () => {
                      setReason('');
                      setCanceling(true);
                    },
                  },
                ]
              : []),
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <RecordDetails
              entries={[
                { label: 'Type', value: COURSE_TYPE_LABELS[row.type] },
                ...(row.courseBundleId !== null && row.bundleLabel !== null
                  ? [
                      {
                        label: 'Lot de séances',
                        value: (
                          <CourseBundleLink
                            bundle={{ id: row.courseBundleId, label: row.bundleLabel }}
                          />
                        ),
                      },
                    ]
                  : []),
                { label: 'Date', value: formatScheduleDate(row.startsAt) },
                {
                  label: 'Horaires',
                  value: formatScheduleTimeRange(row.startsAt, row.endsAt),
                },
                { label: 'Prix', value: row.price === null ? '-' : formatPrice(row.price) },
                {
                  label: 'Visibilité',
                  value: <VisibilityChip visibility={row.visibility} size="small" />,
                },
              ]}
            />
          </Box>
          <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Statut
            </Typography>
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h3">
                <CourseCounts
                  registeredCount={row.registeredCount}
                  capacity={row.capacity}
                  presence={{
                    pending: row.pending,
                    present: row.present,
                    absent: row.absent,
                  }}
                />
              </Typography>
            </Box>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {row.internalNotes.length > 0 ? row.internalNotes : '-'}
              </Typography>
            </Stack>
          </Card>
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Inscriptions</Typography>
          <CoursePresenceGrid courseId={row.id} attendanceMode={attendanceMode} />
        </Stack>
        {row.courseBundleId === null && (
          <Stack spacing={2}>
            <Typography variant="h6">Historique</Typography>
            <RegistrationEventGrid courseId={row.id} />
          </Stack>
        )}
        {canceling && (
          <ConfirmDialog
            procedure={api.course.cancel}
            input={{ id: row.id, cancellationReason: reason }}
            title="Annuler la séance"
            message="Tous les inscrits recevront un e-mail de notification. Cette action est irréversible."
            confirmLabel="Annuler la séance"
            successMessage="Séance annulée."
            onClose={() => setCanceling(false)}
          >
            <TextField
              label="Motif (optionnel)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              multiline
              fullWidth
              margin="normal"
            />
          </ConfirmDialog>
        )}
      </Stack>
    </PageLayout>
  );
};
