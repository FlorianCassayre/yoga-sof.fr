'use client';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseLink } from '../course/CourseLink';
import { CourseBundleLink } from '../courseBundle/CourseBundleLink';
import { PersonLink } from '../user/PersonLink';

type EventRow = RouterOutputs['registration']['listEvents']['rows'][number];

const EVENT_TYPE_LABELS = {
  inscription: 'Inscription',
  annulation: 'Annulation',
} as const;

const EventTarget = ({ row }: { row: EventRow }) => {
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
    headerName: 'Cible',
    flex: 2,
    type: 'dateTime',
    renderCell: (params) => <EventTarget row={params.row} />,
  },
  {
    field: 'date',
    headerName: 'Date',
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.date} />,
  },
];

interface RegistrationEventGridProps {
  courseId?: number;
  courseBundleId?: number;
  userId?: string;
}

export const RegistrationEventGrid = ({
  courseId,
  courseBundleId,
  userId,
}: RegistrationEventGridProps) => {
  const columns = EVENT_COLUMNS.filter(
    (column) =>
      (courseId === undefined || column.field !== 'courseStartsAt') &&
      (courseBundleId === undefined || column.field !== 'courseStartsAt') &&
      (userId === undefined || column.field !== 'userName'),
  );

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'date', sort: 'desc' }}
      procedure={api.registration.listEvents}
      listInput={{ courseId, courseBundleId, userId }}
    />
  );
};
