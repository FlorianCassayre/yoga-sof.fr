import React, { useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel } from '@mui/icons-material';
import {
  formatDateDDsmmYYYY,
  formatTimeHHhMM,
  formatWeekday,
} from '../../../lib/common/date';
import { Course, CourseType, Prisma } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/course';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../lib/common/trpc';
import { FrontsiteCancelCourseRegistrationDialog } from '../../FrontsiteCancelCourseRegistrationDialog';
import { CourseStatusChip } from '../../CourseStatusChip';
import { relativeTimestamp } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { QueryKey } from '../../../lib/server/controllers';

interface GridActionCancelRegistrationProps {
  courseRegistration: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>;
}

const GridActionCancelRegistration: React.FC<GridActionCancelRegistrationProps> = ({ courseRegistration }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { invalidateQueries } = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.useMutation('self.cancelRegistration', {
    onSuccess: async () => {
      await Promise.all((
        ['self.findAllRegisteredCourses', 'public.findAllModels', 'public.findAllFutureCourses'] as QueryKey[]
      ).map(query => invalidateQueries(query)));
      enqueueSnackbar(`Vous vous êtes désinscrit de la séance`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la désinscription de la séance`, { variant: 'error' });
    },
  });
  return (
    <>
      <FrontsiteCancelCourseRegistrationDialog courseRegistration={courseRegistration} open={open} setOpen={setOpen} onConfirm={() => mutateCancel({ id: courseRegistration.id })} />
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setOpen(true)} label="Annuler" disabled={isCanceling} />
    </>
  );
};

interface FrontsiteCourseGrid {
  userCanceled: boolean;
  future: boolean | null;
}

export const FrontsiteCourseGrid: React.FunctionComponent<FrontsiteCourseGrid> = ({ userCanceled, future }) => {
  const columns: GridColumns = [
    ...(userCanceled ? [] : [{
      field: 'status',
      headerName: 'Statut',
      sortable: false,
      renderCell: ({ row }) => (
        <CourseStatusChip course={row.course} />
      ),
    } as GridEnrichedColDef]),
    {
      field: 'type',
      headerName: 'Type de séance',
      sortable: false,
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row }) => row.course.type,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'date',
      headerName: 'Date et heure',
      minWidth: 100,
      flex: 3,
      valueGetter: ({ row: { course } }) => [course.dateStart, course.dateEnd],
      valueFormatter: ({ value: [dateStart, dateEnd] }) =>
        `Le ${formatWeekday(dateStart, false)} ${formatDateDDsmmYYYY(dateStart)} de ${formatTimeHHhMM(dateStart)} à ${formatTimeHHhMM(dateEnd)}`,
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Inscription`,
      flex: 1.5,
    }),
    ...(userCanceled ? [relativeTimestamp({
      field: 'canceledAt',
      headerName: `Désinscription`,
      flex: 1.5,
    })] : []),
    ...(future ? [{
      field: 'actions',
      type: 'actions',
      headerName: 'Désinscription',
      minWidth: 120,
      getActions: ({ row }: GridRowParams<Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>>) => !row.course.isCanceled && future ? [
        <GridActionCancelRegistration courseRegistration={row} />,
      ] : [],
    } as GridEnrichedColDef] : []),
  ];

  return (
    <AsyncGrid columns={columns} query={['self.findAllRegisteredCourses', { userCanceled, future }]} />
  );
};
