import React, { Fragment, useMemo, useState } from 'react';
import { BackofficeContent } from '../../../../../components/layout/admin/BackofficeContent';
import {
  AddBox,
  ArrowBack,
  ArrowForward,
  ArrowLeft,
  Assignment,
  Cancel,
  Edit,
  EmojiPeople,
  Event, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight,
  Notes, Public, VisibilityOff,
} from '@mui/icons-material';
import { Course, Prisma } from '@prisma/client';
import { useRouter } from 'next/router';
import { useSchemaQuery } from '../../../../../components/hooks/useSchemaQuery';
import { courseFindTransformSchema } from '../../../../../common/schemas/course';
import { displayCourseName } from '../../../../../common/display';
import { CourseRegistrationEventGrid } from '../../../../../components/grid/grids/CourseRegistrationEventGrid';
import { CourseRegistrationGrid } from '../../../../../components/grid/grids/CourseRegistrationGrid';
import {
  Alert,
  Box,
  Card, CardActions, CardContent, Grid, IconButton,
  Stack,
  Typography,
  Link as MuiLink, Tooltip, Chip, Skeleton
} from '@mui/material';
import { InformationTableCard } from '../../../../../components/InformationTableCard';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../../../common/course';
import Link from 'next/link';
import { formatDateDDsMMsYYYY, formatTimeHHhMM } from '../../../../../common/date';
import { CourseStatusChip } from '../../../../../components/CourseStatusChip';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../../../common/trpc';
import { CancelCourseDialog } from '../../../../../components/dialogs/CancelCourseDialog';
import { BackofficeContentLoading } from '../../../../../components/layout/admin/BackofficeContentLoading';
import { BackofficeContentError } from '../../../../../components/layout/admin/BackofficeContentError';
import { useBackofficeWritePermission } from '../../../../../components/hooks/usePermission';

interface CourseNavigationProps {
  courseId: number;
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({ courseId }) => {
  const { data, isLoading } = trpc.course.findRelated.useQuery({ id: courseId });

  type NavigationItem = { label: string, course: Course | null, icon: React.ReactElement };
  type NavigationRow = { previous: NavigationItem, next: NavigationItem };

  const rows: NavigationRow[] | undefined = useMemo(() => {
    if (data !== undefined) {
      return [
        {
          previous: {
            label: 'Semaine dernière',
            course: data.previousWeek,
            icon: <KeyboardDoubleArrowLeft />,
          },
          next: {
            label: 'Semaine prochaine',
            course: data.nextWeek,
            icon: <KeyboardDoubleArrowRight />,
          },
        },
        {
          previous: {
            label: 'Séance précédente',
            course: data.previous,
            icon: <ArrowBack />,
          },
          next: {
            label: 'Séance suivante',
            course: data.next,
            icon: <ArrowForward />,
          },
        },
      ].filter(({ previous: { course: c1 }, next: { course: c2 } }) => c1 !== null || c2 !== null);
    } else {
      return undefined;
    }
  }, [data]);

  return isLoading || (rows && rows.length > 0) ? (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {rows !== undefined ? (
        rows.map(({ previous, next }, i) => (
          <Fragment key={i}>
            {[{ item: previous, side: false }, { item: next, side: true }].map(({ item: { label, course, icon }, side }, j) => (
              <Grid key={j} item xs={6} textAlign={side ? 'right' : undefined}>
                {course !== null && (
                  <Tooltip title={displayCourseName(course)}>
                    <span>
                      <Link href={{ pathname: '/administration/seances/planning/[id]', query: { id: course.id } }} passHref legacyBehavior>
                        <Chip component="a" label={label} color="primary" variant="outlined" icon={icon} />
                      </Link>
                    </span>
                  </Tooltip>
                )}
              </Grid>
            ))}
          </Fragment>
        ))
      ) : (
        <>
          <Grid item xs={6}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', width: '10rem' }} />
          </Grid>
          <Grid item xs={6}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', width: '10rem', ml: 'auto' }} />
          </Grid>
        </>
      )}
    </Grid>
  ) : null;
};

interface CourseContentProps {
  course: Prisma.CourseGetPayload<{ include: { registrations: true } }>;
}

const CourseContent: React.FunctionComponent<CourseContentProps> = ({ course }: CourseContentProps) => {
  const router = useRouter();
  const hasWritePermission = useBackofficeWritePermission();
  const status = getCourseStatusWithRegistrations(course);
  const { enqueueSnackbar } = useSnackbar();
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);
  const trpcClient = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.course.cancel.useMutation({ // TODO factor this to avoid duplicating code
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.course.find, trpcClient.course.findUpdate, trpcClient.course.findUpdateNotes, trpcClient.course.findAll, trpcClient.courseRegistration.findAll, trpcClient.courseRegistration.findAllEvents, trpcClient.courseRegistration.findAllActive]
      ).map(procedure => procedure.invalidate()));
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
      actions={hasWritePermission ? [
        { name: 'Modifier mes notes', icon: <Notes />, url: { pathname: `/administration/seances/planning/[id]/notes`, query: { id: course.id, redirect: router.asPath } } },
        ...(!course.isCanceled && (!status.isBeforeStart || status.isInExtendedPeriod) ? [{ name: isCheckingAttendance ? `Ne plus faire l'appel` : `Faire l'appel`, icon: <EmojiPeople />, onClick: () => setCheckingAttendance(!isCheckingAttendance) }] : []),
        ...(!course.isCanceled && (status.isBeforeStart || status.isInExtendedPeriod) ? [{ name: 'Modifier la séance', icon: <Edit />, url: { pathname: `/administration/seances/planning/[id]/edition`, query: { id: course.id, redirect: router.asPath } } }] : []),
        ...(!course.isCanceled && (!status.isAfterEnd || status.isInExtendedPeriod) ? [{ name: 'Annuler la séance', icon: <Cancel />, onClick: () => setConfirmCancelDialogOpen(true), disabled: isCanceling }] : []),
      ] : []}
      quickActions={hasWritePermission ? [
        ...(status.canRegister ? [{ name: 'Inscrire des utilisateurs', icon: <Assignment />, url: { pathname: `/administration/inscriptions/creation`, query: { courseId: course.id, redirect: router.asPath } } }] : []),
      ] : []}
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
              { header: 'Visibilité', value:
                  <Chip
                    label={course.visible ? 'Publique' : 'Cachée'}
                    color={course.visible ? undefined : 'error'}
                    icon={course.visible ? <Public /> : <VisibilityOff />}
                    variant="outlined" size="small"
                  />
              },
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
                  {!status.isBeforeStart && (
                    <>
                      <Box display="inline" color={course.isCanceled ? 'text.secondary' : status.presenceNotFilled ? 'orange' : status.attended === status.registered ? 'green' : 'red'}>
                        {course.isCanceled ? '-' : status.attended}
                      </Box>
                      {' / '}
                    </>
                  )}
                  <Box display="inline" color={status.registered > 0 ? 'green' : 'text.secondary'}>
                    {status.registered}
                  </Box>
                  {' / '}
                  {course.slots}
                </Typography>
                <Typography color="text.secondary">
                  {!status.isBeforeStart ? `Présents / ` : ''}
                  Inscrits / Quota
                </Typography>
              </Box>
              {!course.isCanceled && !status.isBeforeStart && status.presenceNotFilled && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  La présence n'a pas encore été entièrement remplie.
                  {!isCheckingAttendance && hasWritePermission && (
                    <>
                      {' '}
                      <MuiLink href="#" onClick={e => { e.stopPropagation(); e.preventDefault(); setCheckingAttendance(true) }}>Faire l'appel ?</MuiLink>
                    </>
                  )}
                </Alert>
              )}
            </CardContent>
            {status.canRegister && hasWritePermission && (
              <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={{ pathname: '/administration/inscriptions/creation', query: { courseId: course.id, redirect: router.asPath } }} passHref legacyBehavior>
                  <Tooltip title="Inscrire des utilisateurs">
                    <IconButton size="small"><AddBox /></IconButton>
                  </Tooltip>
                </Link>
              </CardActions>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" component="div">
                Notes
              </Typography>
              {!course.notes && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Aucune note pour cette séance.
                  {hasWritePermission && (
                    <>
                      {' '}
                      <Link href={`/administration/seances/planning/${course.id}/notes`} passHref legacyBehavior>
                        <MuiLink>Écrire une note ?</MuiLink>
                      </Link>
                    </>
                  )}
                </Alert>
              )}
              <Typography paragraph sx={{ fontStyle: 'italic', mb: 0 }}>
                {course.notes}
              </Typography>
            </CardContent>
            {hasWritePermission && (
              <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={{ pathname: '/administration/seances/planning/[id]/notes', query: { id: course.id, redirect: router.asPath } }} passHref legacyBehavior>
                  <Tooltip title="Modifier">
                    <IconButton size="small"><Edit /></IconButton>
                  </Tooltip>
                </Link>
              </CardActions>
            )}
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Inscrits à cette séance
      </Typography>
      <CourseRegistrationGrid courseId={course.id} attendance={!course.isCanceled && (!status.isBeforeStart || status.isInExtendedPeriod)} attendanceModifiable={isCheckingAttendance} />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Historique d'inscriptions à cette séance
      </Typography>
      <CourseRegistrationEventGrid courseId={course.id} />

      <CourseNavigation courseId={course.id} />
    </BackofficeContent>
  );
};

export default function AdminCourse() {
  const router = useRouter();
  const { id } = router.query;
  const result = useSchemaQuery(trpc.course.find, { id }, courseFindTransformSchema);

  return result && result.data ? (
    <CourseContent course={result.data as CourseContentProps['course']} />
  ) : result?.isLoading ? <BackofficeContentLoading /> : <BackofficeContentError error={result?.error} />;
}
