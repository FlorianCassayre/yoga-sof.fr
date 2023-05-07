import React, { useCallback, useState } from 'react';
import { Cancel, CheckCircle, Close, Done, Help } from '@mui/icons-material';
import { Prisma } from '@prisma/client';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, orderColumn, relativeTimestamp, userColumn } from './common';
import { CancelCourseRegistrationDialog } from '../../CancelCourseRegistrationDialog';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../common/trpc';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { getCourseStatus } from '../../../common/course';
import { getUserLatestMembership } from '../../../common/user';
import { Chip } from '@mui/material';
import { RouterOutput } from '../../../server/controllers/types';
import { QuickOrderDialog } from '../../QuickOrderDialog';

interface GridActionsAttendanceProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>;
  readOnly: boolean;
}

const GridActionsAttendance: React.FC<GridActionsAttendanceProps> = ({ courseRegistration, readOnly }) => {
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateAttendance, isLoading: isUpdatingAttendance } = trpc.courseRegistration.attended.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.course.find, trpcClient.course.findAll, trpcClient.courseRegistration.findAll, trpcClient.courseRegistration.findAllEvents, trpcClient.courseRegistration.findAllActive]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`La présence a été modifiée`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la mise à jour de la présence`, { variant: 'error' });
    },
  });
  const mutateCourseRegistrationAttendance = useCallback((attended: boolean | null) => mutateAttendance({ id: courseRegistration.id, attended }), [mutateAttendance]);
  const common = { disabled: isUpdatingAttendance };
  const value = courseRegistration.attended;
  return readOnly ? (
    value === false ? (
      <Cancel color="error" fontSize="small" />
    ) : value === null ? (
      <Help color="warning" fontSize="small" />
    ) : (
      <CheckCircle color="success" fontSize="small" />
    )
  ) : (
    <>
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => mutateCourseRegistrationAttendance(false)} label="Absent(e)" color={value === false ? 'error' : undefined} {...common} />
      <GridActionsCellItemTooltip icon={<Help />} onClick={() => mutateCourseRegistrationAttendance(null)} label="Non rempli" color={value === null ? 'warning' : undefined} {...common} />
      <GridActionsCellItemTooltip icon={<CheckCircle />} onClick={() => mutateCourseRegistrationAttendance(true)} label="Présent(e)" color={value === true ? 'success' : undefined} {...common} />
    </>
  );
};

interface GridActionCancelProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>;
}

const GridActionCancel: React.FC<GridActionCancelProps> = ({ courseRegistration }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.courseRegistration.cancel.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.course.find, trpcClient.course.findAll, trpcClient.courseRegistration.findAll, trpcClient.courseRegistration.findAllEvents, trpcClient.courseRegistration.findAllActive]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`L'inscription de l'utilisateur à la séance a été annulée`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de l'annulation de l'inscription de l'utilisateur à la séance`, { variant: 'error' });
    },
  });
  const status = getCourseStatus(courseRegistration.course);
  return (
    <>
      <CancelCourseRegistrationDialog courseRegistration={courseRegistration} open={open} setOpen={setOpen} onConfirm={() => mutateCancel({ id: courseRegistration.id })} />
      {!courseRegistration.course.isCanceled && (status.isBeforeStart || status.isInExtendedPeriod) && (
        <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setOpen(true)} label="Annuler" disabled={isCanceling} />
      )}
    </>
  );
};

interface CourseRegistrationGridProps {
  courseId?: number;
  userId?: number;
  attended?: boolean;
  attendance?: boolean;
  attendanceModifiable?: boolean;
}

export const CourseRegistrationGrid: React.FunctionComponent<CourseRegistrationGridProps> = ({ courseId, userId, attended, attendance, attendanceModifiable }) => {
  const trpcClient = trpc.useContext();
  const { enqueueSnackbar } = useSnackbar();
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [quickOrderCourseRegistration, setQuickOrderCourseRegistration] = useState<any>(); // TODO this is garbage
  const { mutate: mutateQuickOrder, isLoading: isMutatingQuickOrder } = trpc.order.createAutomatically.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.course.find, trpcClient.course.findAll, trpcClient.courseRegistration.findAll, trpcClient.courseRegistration.findAllEvents, trpcClient.courseRegistration.findAllActive, trpcClient.order.findAll, trpcClient.order.find]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`La séance a été marquée comme payée avec la carte`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Impossible de payer cette séance automatiquement : l'utilisateur ne possède peut-être pas de carte`, { variant: 'error' });
    },
  });

  type CourseRegistrationItem = RouterOutput['courseRegistration']['findAllActive'][0];

  const columns: GridColDef<CourseRegistrationItem>[] = [
    ...(attendance ? [{
      field: 'attendance',
      type: 'actions',
      headerName: 'Présence',
      minWidth: 150,
      getActions: ({ row }: GridRowParams<CourseRegistrationItem>) => [
        <GridActionsAttendance courseRegistration={row} readOnly={!attendanceModifiable} />,
      ],
    } satisfies GridColDef<CourseRegistrationItem>] : []),
    ...(userId !== undefined ? [] : [userColumn({ field: 'user', flex: 1 })]),
    ...(courseId !== undefined ? [] : [courseColumn({ field: 'course', flex: 1 })]),
    relativeTimestamp({ field: 'createdAt', headerName: `Date d'inscription`, flex: 1 }),
    {
      field: 'membership',
      headerName: 'Adhésion',
      minWidth: 100,
      valueGetter: ({ row }: { row: Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: { include: { memberships: true } } } }> }) =>
        !!getUserLatestMembership(row.user, row.course.dateStart),
      renderCell: ({ value }) =>
        value ? (
          <Chip label="Oui" color="success" variant="outlined" icon={<Done />} />
        ) : (
          <Chip label="Non" color="default" variant="outlined" icon={<Close />} />
        ),
    },
    orderColumn({
      field: 'order',
      headerName: 'Payée',
      valueGetter: ({ row }: GridValueGetterParams<CourseRegistrationItem>) =>
        [row.orderUsedCoupons.map(o => o.order), row.orderTrial.map(o => o.order), row.orderReplacementTo.map(o => o.order), row.orderPurchased]
          .flat().map(({ id }) => id)[0],
    }, { onClickNo: !isMutatingQuickOrder ? ({ row: courseRegistration }) => { setQuickOrderCourseRegistration(courseRegistration); setQuickOrderOpen(true) } : undefined }),
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<CourseRegistrationItem>) => !row.isUserCanceled ? [
        <GridActionCancel courseRegistration={row} />,
      ] : [],
    },
  ];

  return (
    <>
      <AsyncGrid columns={columns} procedure={trpc.courseRegistration.findAllActive} input={{ courseId, userId, attended }} initialSort={{ field: 'createdAt', sort: 'desc' }} />
      <QuickOrderDialog courseRegistration={quickOrderCourseRegistration} open={quickOrderOpen} setOpen={setQuickOrderOpen} onConfirm={() => mutateQuickOrder({ courseRegistrationId: quickOrderCourseRegistration.id })} />
    </>
  );
};
