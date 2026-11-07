'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseLink } from '../course/CourseLink';
import { PersonLink } from '../user/PersonLink';
import { PresenceButtons } from './presence/PresenceButtons';
import { PresenceIcon } from './presence/PresenceIcon';

type RegistrationRow = RouterOutputs['registration']['list']['rows'][number];

const REGISTRATION_COLUMNS: GridColumns<RegistrationRow> = [
  {
    field: 'userName',
    headerName: 'Utilisateur',
    flex: 1,
    renderCell: (params) => <PersonLink person={params.row} />,
  },
  {
    field: 'courseStartsAt',
    headerName: 'Séance',
    flex: 2,
    type: 'dateTime',
    renderCell: (params) => (
      <CourseLink
        course={{
          id: params.row.courseId,
          type: params.row.courseType,
          startsAt: params.row.courseStartsAt,
          endsAt: params.row.courseEndsAt,
        }}
      />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Inscrit le',
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
  },
];

interface CourseUserRegistrationGridProps {
  courseId?: number;
  userId?: string;
  attendanceMode?: boolean;
}

export const CourseUserRegistrationGrid = ({
  courseId,
  userId,
  attendanceMode = false,
}: CourseUserRegistrationGridProps) => {
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
  const presenceColumn: GridColumns<RegistrationRow>[number] = {
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
          onChange={(present) => setPresence.mutate({ id: params.row.id, present })}
        />
      ) : (
        <PresenceIcon value={params.row.present} />
      ),
  };

  const columns: GridColumns<RegistrationRow> = [
    ...(courseId !== undefined ? [presenceColumn] : []),
    ...REGISTRATION_COLUMNS.filter(
      (column) =>
        (courseId === undefined || column.field !== 'courseStartsAt') &&
        (userId === undefined || column.field !== 'userName'),
    ),
  ];

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.registration.list}
      listInput={{ courseId, userId }}
    />
  );
};
