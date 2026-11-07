'use client';

import { IconButton } from '@mui/material';
import { NOTIFICATION_TYPE_LABELS } from '@yoga-sof/core';
import { Eye } from 'lucide-react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseLink } from '../course/CourseLink';

type NotificationRow = RouterOutputs['notification']['list']['rows'][number];

const columns: GridColumns<NotificationRow> = [
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    renderCell: (params) => (
      <IconButton component={Link} href={`/seances/${params.row.courseId}`} size="small">
        <Eye size={18} />
      </IconButton>
    ),
  },
  {
    field: 'type',
    headerName: 'Tâche',
    flex: 1,
    valueFormatter: (value) => NOTIFICATION_TYPE_LABELS[value],
  },
  {
    field: 'courseStartsAt',
    headerName: 'Action',
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
    field: 'date',
    headerName: 'Date',
    flex: 1,
    type: 'dateTime',
    renderCell: (params) => <DateTimeCell value={params.row.date} />,
  },
];

export const NotificationsGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'date', sort: 'desc' }}
      procedure={api.notification.list}
    />
  );
};
