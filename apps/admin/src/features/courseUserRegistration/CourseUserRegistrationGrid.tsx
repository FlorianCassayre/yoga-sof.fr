'use client';

import { Link } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { courseLabel } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type RegistrationRow = RouterOutputs['registration']['list']['rows'][number];

const REGISTRATION_COLUMNS: GridColDef<RegistrationRow>[] = [
  {
    field: 'userName',
    headerName: 'Utilisateur',
    flex: 1,
    renderCell: (params) => (
      <Link href={`/utilisateurs/${params.row.userId}`}>{params.row.userName ?? '-'}</Link>
    ),
  },
  {
    field: 'courseStartsAt',
    headerName: 'Séance',
    flex: 2,
    type: 'dateTime',
    renderCell: (params) => (
      <Link href={`/seances/${params.row.courseId}`}>
        {courseLabel({
          type: params.row.courseType,
          startsAt: params.row.courseStartsAt,
          endsAt: params.row.courseEndsAt,
        })}
      </Link>
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
}

export const CourseUserRegistrationGrid = ({
  courseId,
  userId,
}: CourseUserRegistrationGridProps) => {
  const columns = REGISTRATION_COLUMNS.filter(
    (column) =>
      (courseId === undefined || column.field !== 'courseStartsAt') &&
      (userId === undefined || column.field !== 'userName'),
  );

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.registration.list}
      listInput={{ courseId, userId }}
    />
  );
};
