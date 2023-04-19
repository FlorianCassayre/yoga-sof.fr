import React, { useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, Edit, Notes, Visibility } from '@mui/icons-material';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../../../common/date';
import { Course, CourseType, Prisma } from '@prisma/client';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../common/course';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box } from '@mui/material';
import { CancelCourseDialog } from '../../CancelCourseDialog';
import { trpc } from '../../../common/trpc';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';

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
  const router = useRouter();

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      sortable: false,
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" href={{ pathname: '/administration/seances/planning/[id]', query: { id: row.id } }} />,
      ],
    },
    {
      field: 'status',
      headerName: 'Statut',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<Course>) => (
        <CourseStatusChip course={row} />
      ),
    },
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'dateStart',
      headerName: 'Date',
      minWidth: 110,
      flex: 1,
      valueFormatter: ({ value }) => `${formatWeekday(value)} ${formatDateDDsmmYYYY(value)}`,
    },
    {
      field: 'time',
      headerName: 'Horaire',
      minWidth: 150,
      flex: 1,
      valueGetter: params => [params.row.dateStart, params.row.dateEnd],
      sortComparator: (([date1,], [date2,]) => formatTimeHHhMM(date1) < formatTimeHHhMM(date2) ? -1 : 1) as GridComparatorFn<[Date, Date]>,
      valueFormatter: params => params.value.map((v: string) => formatTimeHHhMM(v)).join(' à '),
    },
    {
      field: 'price',
      headerName: 'Prix',
      minWidth: 80,
      flex: 0.5,
      valueFormatter: ({ value }: { value: number }) => value > 0 ? `${value} €` : 'Gratuit',
    },
    {
      field: 'registrations',
      headerName: (future ? '' : 'Présents / ') + 'Inscrits / Quota',
      minWidth: future ? 100 : 150,
      flex: 1,
      valueGetter: params => getCourseStatusWithRegistrations(params.row).registered,
      renderCell: ({ row }: GridRenderCellParams<Prisma.CourseGetPayload<{ include: { registrations: true } }>>) => {
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
    ...(!readOnly ? [{
      field: 'actions',
      type: 'actions',
      minWidth: 130,
      getActions: CourseGridActions,
    } as GridEnrichedColDef] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.course.findAll} input={{ future, canceled, extended: null }} initialSort={{ field: 'dateStart', sort: future ? 'asc' : 'desc' }} />
  );
};
