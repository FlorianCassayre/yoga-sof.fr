import React, { useState } from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel } from '@mui/icons-material';
import { CourseRegistration, Prisma } from '@prisma/client';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { CancelCourseRegistrationDialog } from '../../CancelCourseRegistrationDialog';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../lib/common/trpc';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';

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
}

export const CourseRegistrationGrid: React.FunctionComponent<CourseRegistrationGridProps> = ({ courseId, userId }) => {
  const columns: GridColumns = [
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
