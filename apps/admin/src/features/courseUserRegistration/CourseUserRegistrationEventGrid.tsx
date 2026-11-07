'use client';

import { courseLabel } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';

type EventRow = RouterOutputs['registration']['listEvents']['rows'][number];

const EVENT_TYPE_LABELS = {
  inscription: 'Inscription',
  annulation: 'Annulation',
} as const;

const EVENT_COLUMNS: GridColumns<EventRow> = [
  {
    field: 'type',
    headerName: 'Événement',
    width: 130,
    valueFormatter: (value) => EVENT_TYPE_LABELS[value],
  },
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
    field: 'date',
    headerName: 'Date',
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.date} />,
  },
];

interface CourseUserRegistrationEventGridProps {
  courseId?: number;
  userId?: string;
}

export const CourseUserRegistrationEventGrid = ({
  courseId,
  userId,
}: CourseUserRegistrationEventGridProps) => {
  const columns = EVENT_COLUMNS.filter(
    (column) =>
      (courseId === undefined || column.field !== 'courseStartsAt') &&
      (userId === undefined || column.field !== 'userName'),
  );

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'date', sort: 'desc' }}
      procedure={api.registration.listEvents}
      listInput={{ courseId, userId }}
    />
  );
};
