import React, { useState } from 'react';
import { Cancel } from '@mui/icons-material';
import {
  formatDateDDsmmYYYY,
  formatTimeHHhMM,
  formatWeekday,
} from '../../../common/date';
import { CourseTypeNames } from '../../../common/course';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useSnackbar } from 'notistack';
import { trpc } from '../../../common/trpc';
import { FrontsiteCancelCourseRegistrationDialog } from '../../dialogs/FrontsiteCancelCourseRegistrationDialog';
import { CourseStatusChip } from '../../CourseStatusChip';
import { relativeTimestamp, simpleOrderColumn } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { RouterOutput } from '../../../server/controllers/types';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { displayCourseName } from '../../../common/display';
import { CourseRegistration } from '@prisma/client';

interface GridActionCancelRegistrationProps {
  userId: number;
  courseRegistration: Pick<CourseRegistration, 'id'> & { course: Parameters<typeof displayCourseName>[0] };
  disabled?: boolean;
}

const GridActionCancelRegistration: React.FC<GridActionCancelRegistrationProps> = ({ userId, courseRegistration, disabled }) => {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const trpcClient = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.self.cancelRegistration.useMutation({
    onSuccess: async () => {
      await Promise.all((
        [trpcClient.self.findAllRegisteredCourses, trpcClient.public.findAllModels, trpcClient.public.findAllFutureCourses]
      ).map(procedure => procedure.invalidate()));
      enqueueSnackbar(`Vous vous êtes désinscrit de la séance`, { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de la désinscription de la séance`, { variant: 'error' });
    },
  });
  return (
    <>
      <FrontsiteCancelCourseRegistrationDialog courseRegistration={courseRegistration} open={open} setOpen={setOpen} onConfirm={() => mutateCancel({ userId, id: courseRegistration.id })} />
      <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setOpen(true)} label={!disabled ? 'Annuler' : `La désinscription n'est plus possible`} disabled={isCanceling || disabled} />
    </>
  );
};

interface FrontsiteCourseGrid {
  userId: number;
  userCanceled: boolean;
  future: boolean | null;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const FrontsiteCourseGrid: React.FunctionComponent<FrontsiteCourseGrid> = ({ userId, userCanceled, future, collapsible, collapsedSummary }) => {
  const nowLater = new Date();
  nowLater.setDate(nowLater.getDate() + 1);
  type CourseRegistrationItem = RouterOutput['self']['findAllRegisteredCourses'][0];
  const columns: GridColDef<CourseRegistrationItem>[] = [
    ...(userCanceled ? [] : [{
      field: 'status',
      headerName: 'Statut',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<CourseRegistrationItem>) => !!row && (
        <CourseStatusChip course={row.course} />
      ),
    } satisfies GridColDef<CourseRegistrationItem>]),
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<CourseRegistrationItem>) => !!row && CourseTypeNames[row.course.type],
    },
    {
      field: 'date',
      headerName: 'Date et heure',
      minWidth: 350,
      flex: 3,
      valueGetter: ({ row: { course } }: GridValueGetterParams<CourseRegistrationItem>): [Date, Date] => [course.dateStart, course.dateEnd],
      sortComparator: (([date1,], [date2,]) => date1 < date2 ? -1 : 1) satisfies GridComparatorFn<[Date, Date]>,
      valueFormatter: ({ value: [dateStart, dateEnd] }: GridValueFormatterParams<[Date, Date]>) =>
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
    }) satisfies GridColDef<CourseRegistrationItem>] : []),
    ...(userCanceled ? [] : [simpleOrderColumn({
      field: 'paid',
    }) satisfies GridColDef<CourseRegistrationItem>]),
    ...(future ? [{
      field: 'actions',
      type: 'actions',
      headerName: 'Désinscription',
      minWidth: 120,
      getActions: ({ row }: GridRowParams<CourseRegistrationItem>) => !row.course.isCanceled ? [
        <GridActionCancelRegistration userId={userId} courseRegistration={row} disabled={nowLater.getTime() >= row.course.dateStart.getTime()} />,
      ] : [],
    } satisfies GridColDef<CourseRegistrationItem>] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.self.findAllRegisteredCourses} input={{ userId, userCanceled, future }} initialSort={{ field: 'date', sort: future ? 'asc' : 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
