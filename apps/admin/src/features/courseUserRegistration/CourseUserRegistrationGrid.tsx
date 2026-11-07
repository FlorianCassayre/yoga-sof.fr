'use client';

import { courseLabel } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';

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
