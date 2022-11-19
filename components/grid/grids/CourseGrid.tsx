import React, { useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, Edit, Note, Notes, Visibility } from '@mui/icons-material';
import { formatDateDDsMMsYYYY, formatTimeHHhMM } from '../../../lib/common/newDate';
import { Course, CourseType, Prisma } from '@prisma/client';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../lib/common/newCourse';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box } from '@mui/material';
import { CancelCourseDialog } from '../../CancelCourseDialog';
import { trpc } from '../../../lib/common/trpc';
import { useSnackbar } from 'notistack';

const CourseGridActions = ({ row: course }: GridRowParams<Course>): React.ReactElement[] => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmCancelDialogOpen, setConfirmCancelDialogOpen] = useState(false);
  const { mutate: mutateCancel, isLoading: isCanceling } = trpc.useMutation('course.cancel', {
    onSuccess: () => {
      enqueueSnackbar('La séance a été annulée', { variant: 'success' });
      // TODO invalidate
    },
    onError: () => {
      enqueueSnackbar(`Une erreur est survenue lors de l'annulation de la séance`, { variant: 'error' });
    },
  });

  return [
    <GridActionsCellItem icon={<Notes />} label="Modifier les notes" onClick={() => router.push(`/administration/seances/planning/${course.id}/notes`)} />,
    ...(!course.isCanceled && new Date() < new Date(course.dateStart) && !course.isCanceled ? [
      <GridActionsCellItem icon={<Edit />} label="Modifier" disabled={isCanceling} onClick={() => router.push(`/administration/seances/planning/${course.id}/edition`)} />,
      <>
        <CancelCourseDialog
          course={course}
          open={confirmCancelDialogOpen}
          setOpen={setConfirmCancelDialogOpen}
          onConfirm={(cancelationReason) => mutateCancel({ id: course.id, cancelationReason })}
        />
        <GridActionsCellItem icon={<Cancel />} onClick={() => setConfirmCancelDialogOpen(true)} disabled={isCanceling} label="Annuler" />
      </>,
    ] : []),
  ];
}

interface CourseGridProps {
  future: boolean;
  readOnly?: boolean;
}

export const CourseGrid: React.FunctionComponent<CourseGridProps> = ({ future, readOnly }) => {
  const router = useRouter();

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/seances/planning/${row.id}`)} />,
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
      sortable: false,
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'dateStart',
      headerName: 'Date',
      minWidth: 110,
      flex: 1,
      valueFormatter: params => formatDateDDsMMsYYYY(params.value),
    },
    {
      field: 'time',
      headerName: 'Horaire',
      minWidth: 100,
      flex: 1,
      valueGetter: params => [params.row.dateStart, params.row.dateEnd],
      valueFormatter: params => params.value.map((v: string) => formatTimeHHhMM(v)).join(' à '),
    },
    {
      field: 'price',
      headerName: 'Prix',
      minWidth: 50,
      flex: 0.5,
      valueFormatter: ({ value }: { value: number }) => value > 0 ? `${value} €` : 'Gratuit',
    },
    {
      field: 'registrations',
      headerName: (future ? '' : 'Présence / ') + 'Inscriptions / Place disponibles',
      minWidth: future ? 100 : 150,
      flex: 1,
      renderCell: ({ row }: GridRenderCellParams<Prisma.CourseGetPayload<{ include: { registrations: true } }>>) => {
        const status = getCourseStatusWithRegistrations(row);
        return (
          <Box>
            {!future && (
              <>
                {row.isCanceled ? (
                  <Box display="inline" color="text.secondary">-</Box>
                ) : (
                  <Box display="inline" color={status.registered === 0 ? 'text.secondary' : status.attended < status.registered ? 'orange' : 'green'}>
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
    <AsyncGrid columns={columns} query={['course.findAll', { future }]} />
  );
};
