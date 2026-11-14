'use client';

import { Stack, Typography } from '@mui/material';
import { COURSE_TYPE_LABELS, formatPrice } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseBundleLink } from './CourseBundleLink';
import { formatCourseBundlePeriod } from './formatCourseBundlePeriod';

type CourseBundleRow = RouterOutputs['courseBundle']['list']['rows'][number];

const columns: GridColumns<CourseBundleRow> = [
  {
    field: 'label',
    headerName: 'Libellé',
    flex: 2,
    renderCell: (params) => <CourseBundleLink bundle={params.row} />,
  },
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    valueFormatter: (value) => COURSE_TYPE_LABELS[value],
  },
  {
    field: 'price',
    headerName: 'Prix',
    flex: 1,
    type: 'number',
    valueFormatter: (value) => formatPrice(value),
  },
  {
    field: 'capacity',
    headerName: 'Capacité',
    type: 'number',
    width: 110,
    sortable: false,
  },
  {
    field: 'courseCount',
    headerName: 'Séances',
    type: 'number',
    width: 110,
    sortable: false,
  },
  {
    field: 'startsAt',
    headerName: 'Période',
    flex: 2,
    sortable: false,
    renderCell: (params) => {
      const period = formatCourseBundlePeriod(params.row);

      return period === null ? null : (
        <Stack sx={{ height: '100%', justifyContent: 'center' }}>
          <Typography variant="body2">{period}</Typography>
        </Stack>
      );
    },
  },
];

export const CourseBundleGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'label', sort: 'asc' }}
      procedure={api.courseBundle.list}
    />
  );
};
