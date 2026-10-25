'use client';

import { IconButton } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { keepPreviousData } from '@tanstack/react-query';
import { COURSE_TYPE_LABELS, type CourseVisibility } from '@yoga-sof/core';
import type { CourseSortField } from '@yoga-sof/core/server';
import { dateTimeFormatter } from '@yoga-sof/ui/dateTimeFormatter';
import { Eye } from 'lucide-react';
import Link from 'next/link';

import { useDataGrid } from '../../components/grid/useDataGrid';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { VisibilityChip } from './visibility/VisibilityChip';

type CourseRow = RouterOutputs['course']['list']['rows'][number];

const columns: (GridColDef<CourseRow> & { field: keyof CourseRow | 'actions' })[] = [
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
    headerName: 'Début',
    type: 'dateTime',
    flex: 1,
    valueFormatter: (value) => dateTimeFormatter.format(value),
  },
  {
    field: 'endsAt',
    headerName: 'Fin',
    type: 'dateTime',
    flex: 1,
    valueFormatter: (value) => dateTimeFormatter.format(value),
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
  const grid = useDataGrid<CourseRow, CourseSortField>(columns);
  const courses = api.course.list.useQuery(grid.queryInput, {
    placeholderData: keepPreviousData,
  });

  return <DataGrid {...grid.dataGridProps(courses)} />;
};
