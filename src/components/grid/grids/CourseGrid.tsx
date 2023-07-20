import React, { useState } from 'react';
import { Cancel, Edit, Notes, Visibility } from '@mui/icons-material';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../../../common/date';
import { Course, CourseType } from '@prisma/client';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../common/course';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box } from '@mui/material';
import { CancelCourseDialog } from '../../dialogs/CancelCourseDialog';
import { trpc } from '../../../common/trpc';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { RouterOutput } from '../../../server/controllers/types';
import { useBackofficeWritePermission } from '../../hooks/usePermission';

const CourseGridActions = ({ row: course }: GridRowParams<Course>): React.ReactElement[] => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);
  const trpcClient = trpc.useContext();
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.course.cancel.useMutation({
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

  return [
    <GridActionsCellItemTooltip icon={<Notes />} label="Modifier les notes" href={{ pathname: '/administration/seances/planning/[id]/notes', query: { id: course.id, redirect: router.asPath } }} />,
    ...(!course.isCanceled && new Date() < new Date(course.dateStart) && !course.isCanceled ? [
      <GridActionsCellItemTooltip icon={<Edit />} label="Modifier" disabled={isCanceling} href={{ pathname: '/administration/seances/planning/[id]/edition', query: { id: course.id, redirect: router.asPath } }} />,
      <>
        <CancelCourseDialog
          course={course}
          open={confirmCancelDialogOpen}
          setOpen={setConfirmCancelDialogOpen}
          onConfirm={(cancelationReason) => mutateCancel({ id: course.id, cancelationReason })}
        />
        <GridActionsCellItemTooltip icon={<Cancel />} onClick={() => setConfirmCancelDialogOpen(true)} disabled={isCanceling} label="Annuler" />
      </>,
    ] : []),
  ];
}

interface CourseGridProps {
  future: boolean | null;
  canceled: boolean;
  readOnly?: boolean;
}

export const CourseGrid: React.FunctionComponent<CourseGridProps> = ({ future, canceled, readOnly }) => {
  const hasWritePermission = useBackofficeWritePermission();
  type CourseItem = RouterOutput['course']['findAll'][0];
  const columns: GridColDef<CourseItem>[] = [
    {
      field: 'details',
      type: 'actions',
      sortable: false,
      minWidth: 50,
      getActions: ({ row }: GridRowParams<CourseItem>) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" href={{ pathname: '/administration/seances/planning/[id]', query: { id: row.id } }} />,
      ],
    },
    {
      field: 'status',
      headerName: 'Statut',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<CourseItem>) => (
        <CourseStatusChip course={row} />
      ),
    },
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<CourseType>) => CourseTypeNames[value],
    },
    {
      field: 'dateStart',
      headerName: 'Date',
      minWidth: 110,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<Date>) => `${formatWeekday(value)} ${formatDateDDsmmYYYY(value)}`,
    },
    {
      field: 'time',
      headerName: 'Horaire',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row: { dateStart, dateEnd } }: GridValueGetterParams<CourseItem>) => [dateStart, dateEnd],
      sortComparator: (([date1,], [date2,]) => formatTimeHHhMM(date1) < formatTimeHHhMM(date2) ? -1 : 1) satisfies GridComparatorFn<[Date, Date]>,
      valueFormatter: ({ value }: GridValueFormatterParams<[Date, Date]>) => value.map(v => formatTimeHHhMM(v)).join(' à '),
    },
    {
      field: 'price',
      headerName: 'Prix',
      minWidth: 80,
      flex: 0.5,
      valueFormatter: ({ value }: GridValueFormatterParams<number>) => value > 0 ? `${value} €` : 'Gratuit',
    },
    {
      field: 'registrations',
      headerName: (future ? '' : 'Présents / ') + 'Inscrits / Quota',
      minWidth: future ? 100 : 150,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<CourseItem>) => getCourseStatusWithRegistrations(row).registered,
      renderCell: ({ row }: GridRenderCellParams<CourseItem>) => {
        const status = getCourseStatusWithRegistrations(row);
        return (
          <Box>
            {!future && (
              <>
                {row.isCanceled ? (
                  <Box display="inline" color="text.secondary">-</Box>
                ) : (
                  <Box display="inline" color={status.registered === 0 ? 'text.secondary' : status.attended < status.registered ? (status.presenceNotFilled ? 'orange' : 'red') : 'green'}>
                    {status.attended}
                  </Box>
                )}
                {' / '}
              </>
            )}
            <Box display="inline" color={status.registered > 0 ? 'green' : 'text.secondary'}>{status.registered}</Box>
            {' / '}
            <Box display="inline">{row.slots}</Box>
            {!future && status.presenceNotFilled && (
              <Box display="inline" color="text.secondary"> ?</Box>
            )}
          </Box>
        )
      },
    },
    {
      field: 'notes',
      headerName: 'Notes',
      sortable: false,
      minWidth: 100,
      flex: 1,
    },
    ...(!readOnly && hasWritePermission ? [{
      field: 'actions',
      type: 'actions',
      minWidth: 130,
      getActions: CourseGridActions,
    } satisfies GridColDef<Course>] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.course.findAll} input={{ future, canceled, extended: null }} initialSort={{ field: 'dateStart', sort: future ? 'asc' : 'desc' }} />
  );
};
