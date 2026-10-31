'use client';

import { IconButton } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { COURSE_TYPE_LABELS, type CourseVisibility } from '@yoga-sof/core';
import { formatScheduleDate, formatScheduleTime } from '@yoga-sof/core';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { DataGrid } from '../../components/grid/DataGrid';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { VisibilityChip } from './visibility/VisibilityChip';

type CourseRow = RouterOutputs['course']['list']['rows'][number];

const columns: GridColDef<CourseRow>[] = [
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    renderCell: (params) => (
      <IconButton component={Link} href={`/seances/${params.row.id}`} size="small">
        <Eye size={18} />
      </IconButton>
    ),
  },
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    valueFormatter: (value) => COURSE_TYPE_LABELS[value],
  },
  {
    field: 'startsAt',
    headerName: 'Date',
    type: 'date',
    flex: 1,
    valueFormatter: (value) => formatScheduleDate(value),
  },
  {
    field: 'horaire',
    headerName: 'Horaire',
    width: 140,
    sortable: false,
    renderCell: (params) =>
      `${formatScheduleTime(params.row.startsAt)} à ${formatScheduleTime(params.row.endsAt)}`,
  },
  { field: 'capacity', headerName: 'Capacité', type: 'number', width: 110 },
  { field: 'registeredCount', headerName: 'Inscrits', type: 'number', width: 110 },
  {
    field: 'visibility',
    headerName: 'Visibilité',
    width: 130,
    renderCell: (params) => <VisibilityChip visibility={params.value as CourseVisibility} />,
  },
];

export const CourseGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'startsAt', sort: 'asc' }}
      procedure={api.course.list}
    />
  );
};
