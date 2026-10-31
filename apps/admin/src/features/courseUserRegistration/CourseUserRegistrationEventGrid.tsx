'use client';

import { Link } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { courseLabel } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type EventRow = RouterOutputs['registration']['listEvents']['rows'][number];

const EVENT_TYPE_LABELS = {
  inscription: 'Inscription',
  annulation: 'Annulation',
} as const;

const columns: GridColDef<EventRow>[] = [
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
    field: 'date',
    headerName: 'Date',
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.date} />,
  },
];

export const CourseUserRegistrationEventGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'date', sort: 'desc' }}
      procedure={api.registration.listEvents}
    />
  );
};
