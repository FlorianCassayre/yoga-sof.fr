'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';
import { PresenceButtons } from './presence/PresenceButtons';
import { PresenceIcon } from './presence/PresenceIcon';

type PresenceRow = RouterOutputs['registration']['listCoursePresence']['rows'][number];

interface CoursePresenceGridProps {
  courseId: number;
  attendanceMode?: boolean;
}

export const CoursePresenceGrid = ({
  courseId,
  attendanceMode = false,
}: CoursePresenceGridProps) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const setPresence = api.registration.setPresence.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
    onError: (error: unknown) => {
      enqueueSnackbar(error instanceof Error ? error.message : 'Une erreur est survenue.', {
        variant: 'error',
      });
    },
  });

  const pendingPresenceValue =
    setPresence.isPending && setPresence.variables ? setPresence.variables.present : undefined;
  const presenceColumn: GridColumns<PresenceRow>[number] = {
    field: 'present',
    headerName: 'Présence',
    width: 130,
    align: 'center',
    headerAlign: 'center',
    display: 'flex',
    renderCell: (params) =>
      attendanceMode ? (
        <PresenceButtons
          value={params.row.present}
          pendingValue={pendingPresenceValue}
          onChange={(present) => setPresence.mutate({ id: params.row.id, courseId, present })}
        />
      ) : (
        <PresenceIcon value={params.row.present} />
      ),
  };

  const columns: GridColumns<PresenceRow> = [
    presenceColumn,
    {
      field: 'userName',
      headerName: 'Utilisateur',
      flex: 1,
      renderCell: (params) => <PersonLink person={params.row} />,
    },
    {
      field: 'createdAt',
      headerName: 'Inscrit le',
      type: 'dateTime',
      flex: 1,
      renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
    },
  ];

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.registration.listCoursePresence}
      listInput={{ courseId }}
    />
  );
};
