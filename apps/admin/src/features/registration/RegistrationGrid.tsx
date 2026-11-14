'use client';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseLink } from '../course/CourseLink';
import { CourseBundleLink } from '../courseBundle/CourseBundleLink';
import { PersonLink } from '../user/PersonLink';

type RegistrationRow = RouterOutputs['registration']['list']['rows'][number];

const RegistrationTarget = ({ row }: { row: RegistrationRow }) => {
  if (row.courseBundleId !== null && row.courseBundleLabel !== null) {
    return <CourseBundleLink bundle={{ id: row.courseBundleId, label: row.courseBundleLabel }} />;
  }
  if (
    row.courseId !== null &&
    row.courseType !== null &&
    row.courseStartsAt !== null &&
    row.courseEndsAt !== null
  ) {
    return (
      <CourseLink
        course={{
          id: row.courseId,
          type: row.courseType,
          startsAt: row.courseStartsAt,
          endsAt: row.courseEndsAt,
        }}
      />
    );
  }

  return null;
};

const REGISTRATION_COLUMNS: GridColumns<RegistrationRow> = [
  {
    field: 'userName',
    headerName: 'Utilisateur',
    flex: 1,
    renderCell: (params) => <PersonLink person={params.row} />,
  },
  {
    field: 'courseStartsAt',
    headerName: 'Cible',
    flex: 2,
    type: 'dateTime',
    renderCell: (params) => <RegistrationTarget row={params.row} />,
  },
  {
    field: 'createdAt',
    headerName: 'Inscrit le',
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
  },
];

interface RegistrationGridProps {
  courseBundleId?: number;
  userId?: string;
}

export const RegistrationGrid = ({ courseBundleId, userId }: RegistrationGridProps) => {
  const columns = REGISTRATION_COLUMNS.filter(
    (column) =>
      (userId === undefined || column.field !== 'userName') &&
      (courseBundleId === undefined || column.field !== 'courseStartsAt'),
  );

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.registration.list}
      listInput={{ courseBundleId, userId }}
    />
  );
};
