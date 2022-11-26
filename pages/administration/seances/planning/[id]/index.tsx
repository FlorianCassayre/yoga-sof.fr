import React, { useState } from 'react';
import { BackofficeContent } from '../../../../../components/layout/admin/BackofficeContent';
import { AddBox, Assignment, Cancel, Delete, Edit, EmojiPeople, Event, Notes } from '@mui/icons-material';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../../components/hooks/useSchemaQuery';
import { courseFindTransformSchema } from '../../../../../lib/common/newSchemas/course';
import { displayCourseName } from '../../../../../lib/common/display';
import { CourseRegistrationEventGrid } from '../../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../../components/grid/grids/CourseRegistrationGrid';
import {
  Box,
  Card, CardActions, CardContent, Chip, Grid, IconButton,
  Stack,
  Typography
} from '@mui/material';
import { InformationTableCard } from '../../../../../components/InformationTableCard';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../../../lib/common/course';
import Link from 'next/link';
import { formatDateDDsMMsYYYY, formatTimeHHhMM } from '../../../../../lib/common/date';
import { CourseStatusChip } from '../../../../../components/CourseStatusChip';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../../../lib/common/trpc';
import { CancelCourseDialog } from '../../../../../components/CancelCourseDialog';
import { QueryKey } from '../../../../../lib/server/controllers';

interface CourseContentProps {
  course: Prisma.CourseGetPayload<{ include: { registrations: true } }>;
}

const CourseContent: React.FunctionComponent<CourseContentProps> = ({ course }: CourseContentProps) => {
  const status = getCourseStatusWithRegistrations(course);
  const { enqueueSnackbar } = useSnackbar();
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);
  const { invalidateQueries } = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.useMutation('course.cancel', { // TODO factor this to avoid duplicating code
    onSuccess: async () => {
      await Promise.all((
        ['course.find', 'course.findUpdate', 'course.findUpdateNotes', 'course.findAll', 'courseRegistration.findAll', 'courseRegistration.findAllEvents', 'courseRegistration.findAllActive'] as QueryKey[]
      ).map(query => invalidateQueries(query)));
      await enqueueSnackbar('La séance a été annulée', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de l'annulation de la séance`, { variant: 'error' });
    },
  });
  const [isCheckingAttendance, setCheckingAttendance] = useState(false);
  return (
    <BackofficeContent
      title={displayCourseName(course)}
      icon={<Event />}
      actions={[
        { name: 'Modifier mes notes', icon: <Notes />, url: { pathname: `/administration/seances/planning/[id]/notes`, query: { id: course.id } } },
        ...(!course.isCanceled ? [{ name: isCheckingAttendance ? `Ne plus faire l'appel` : `Faire l'appel`, icon: <EmojiPeople />, onClick: () => setCheckingAttendance(!isCheckingAttendance) }] : []),
        ...(!course.isCanceled && status.isBeforeStart ? [{ name: 'Modifier la séance', icon: <Edit />, url: { pathname: `/administration/seances/planning/[id]/edition`, query: { id: course.id } } }] : []),
        ...(status.canRegister ? [{ name: 'Inscrire des utilisateurs', icon: <Assignment />, url: { pathname: `/administration/inscriptions/creation`, query: { courseId: course.id } } }] : []),
        ...(!course.isCanceled && !status.isAfterEnd ? [{ name: 'Annuler la séance', icon: <Cancel />, onClick: () => setConfirmCancelDialogOpen(true), disabled: isCanceling }] : []),
      ]}
    >
      <CancelCourseDialog
        course={course}
        open={confirmCancelDialogOpen}
        setOpen={setConfirmCancelDialogOpen}
        onConfirm={(cancelationReason) => mutateCancel({ id: course.id, cancelationReason })}
      />
      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Détails de la séance
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <InformationTableCard
            rows={[
              { header: 'Type', value: CourseTypeNames[course.type] },
              { header: 'Places', value: course.slots },
              { header: 'Prix', value: `${course.price} €` },
              { header: 'Date', value: formatDateDDsMMsYYYY(course.dateStart) },
              { header: 'Heures', value: `${formatTimeHHhMM(course.dateStart)} à ${formatTimeHHhMM(course.dateEnd)}` },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Stack direction="row" gap={2}>
                <Typography variant="h6" component="div">
                  Statut
                </Typography>
                <CourseStatusChip course={course} />
              </Stack>
              <Box textAlign="center">
                <Typography variant="h4" component="div" sx={{ mt: 1, mb: 1 }}>
                  <Box display="inline" color={status.registered > 0 ? 'green' : 'text.secondary'}>
                    {status.registered}
                  </Box>
                  {' / '}
                  {course.slots}
                </Typography>
                <Typography color="text.secondary">
                  Inscrits / Quota
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href={{ pathname: '/administration/inscriptions/creation', query: { courseId: course.id } }} passHref>
                <IconButton size="small" aria-label="Inscrire des utilisateurs" disabled={!status.canRegister}><AddBox /></IconButton>
              </Link>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" component="div">
                Notes
              </Typography>
              <Typography paragraph sx={{ fontStyle: 'italic', mb: 0 }}>
                {course.notes}
              </Typography>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link href={`/administration/seances/planning/${course.id}/notes`} passHref>
                <IconButton size="small" aria-label="Modifier"><Edit /></IconButton>
              </Link>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Inscrits à cette séance
      </Typography>
      <CourseRegistrationGrid courseId={course.id} attendance attendanceModifiable={isCheckingAttendance} />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Historique d'inscriptions à cette séance
      </Typography>
      <CourseRegistrationEventGrid courseId={course.id} />
    </BackofficeContent>
  );
};

export default function AdminCourse() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(['course.find', { id }], courseFindTransformSchema);

  return result && result.data ? (
    <CourseContent course={result.data as CourseContentProps['course']} />
  ) : null;
}
