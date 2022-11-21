import React, { useCallback, useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, CheckCircle, Help } from '@mui/icons-material';
import { Prisma } from '@prisma/client';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { CancelCourseRegistrationDialog } from '../../CancelCourseRegistrationDialog';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../lib/common/trpc';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';

interface GridActionsAttendanceProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>;
  readOnly: boolean;
}

const GridActionsAttendance: React.FC<GridActionsAttendanceProps> = ({ courseRegistration, readOnly }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { invalidateQueries } = trpc.useContext();
  const { mutate: mutateAttendance, isLoading: isUpdatingAttendance } = trpc.useMutation('courseRegistration.attended', {
    onSuccess: () => {
      //enqueueSnackbar(`La présence a été modifiée`, { variant: 'success' });
      return invalidateQueries('courseRegistration.findAllActive'); // TODO invalidate more than just this one
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
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.useMutation('courseRegistration.cancel', {
    onSuccess: () => {
      enqueueSnackbar(`L'inscription de l'utilisateur à la séance a été annulée`, { variant: 'success' });
      // TODO invalidate
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de l'annulation de l'inscription de l'utilisateur à la séance`, { variant: 'error' });
    },
  });
  return (
    <>
      <CancelCourseRegistrationDialog courseRegistration={courseRegistration} open={open} setOpen={setOpen} onConfirm={() => mutateCancel({ id: courseRegistration.id })} />
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setOpen(true)} label="Annuler" disabled={isCanceling} />
    </>
  );
};

interface CourseRegistrationGridProps {
  courseId?: number;
  userId?: number;
  attendance?: boolean;
  attendanceModifiable?: boolean;
}

export const CourseRegistrationGrid: React.FunctionComponent<CourseRegistrationGridProps> = ({ courseId, userId, attendance, attendanceModifiable }) => {
  const columns: GridColumns = [
    ...(attendance ? [{
      field: 'attendance',
      type: 'actions',
      headerName: 'Présence',
      minWidth: 150,
      getActions: ({ row }: GridRowParams<Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>>) => [
        <GridActionsAttendance courseRegistration={row} readOnly={!attendanceModifiable} />,
      ],
    } as GridEnrichedColDef] : []),
    ...(userId !== undefined ? [] : [userColumn({ field: 'user', flex: 1 })]),
    ...(courseId !== undefined ? [] : [courseColumn({ field: 'course', flex: 1 })]),
    relativeTimestamp({ field: 'createdAt', headerName: `Date d'inscription`, flex: 1 }),
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<Prisma.CourseRegistrationGetPayload<{ include: { course: true, user: true } }>>) => !row.isUserCanceled ? [ // TODO
        <GridActionCancel courseRegistration={row} />,
      ] : [],
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['courseRegistration.findAllActive', { courseId, userId }]} />
  );
};
