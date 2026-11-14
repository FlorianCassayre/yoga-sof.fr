'use client';

import { IconButton } from '@mui/material';
import { COURSE_TYPE_LABELS, type CourseVisibility } from '@yoga-sof/core';
import { formatScheduleDate, formatScheduleTime } from '@yoga-sof/core';
import { Eye } from 'lucide-react';

import { DataGrid } from '../../components/grid/DataGrid';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseBundleLink } from '../courseBundle/CourseBundleLink';
import { VisibilityChip } from './visibility/VisibilityChip';

type CourseRow = RouterOutputs['course']['list']['rows'][number];

const columns: GridColumns<CourseRow, 'horaire'> = [
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
    field: 'bundleLabel',
    headerName: 'Lot de séances',
    flex: 1,
    renderCell: (params) =>
      params.row.courseBundleId === null || params.row.bundleLabel === null ? null : (
        <CourseBundleLink
          bundle={{ id: params.row.courseBundleId, label: params.row.bundleLabel }}
        />
      ),
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

interface CourseGridProps {
  courseBundleId?: number;
}

export const CourseGrid = ({ courseBundleId }: CourseGridProps) => {
  const filteredColumns = columns.filter(
    (column) => courseBundleId === undefined || column.field !== 'bundleLabel',
  );

  return (
    <DataGrid
      columns={filteredColumns}
      defaultSort={{ field: 'startsAt', sort: 'asc' }}
      procedure={api.course.list}
      listInput={{ courseBundleId }}
    />
  );
};
