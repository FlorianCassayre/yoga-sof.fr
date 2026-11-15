'use client';

import { Stack, Typography } from '@mui/material';
import { formatPrice } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { formatCourseBundlePeriod } from '../courseBundle/formatCourseBundlePeriod';
import { CourseSuperBundleLink } from './CourseSuperBundleLink';

type CourseSuperBundleRow = RouterOutputs['courseSuperBundle']['list']['rows'][number];

const columns: GridColumns<CourseSuperBundleRow> = [
  {
    field: 'label',
    headerName: 'Libellé',
    flex: 2,
    renderCell: (params) => <CourseSuperBundleLink superBundle={params.row} />,
  },
  {
    field: 'price',
    headerName: 'Prix',
    flex: 1,
    type: 'number',
    valueFormatter: (value) => formatPrice(value),
  },
  {
    field: 'bundleCount',
    headerName: 'Lots',
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

export const CourseSuperBundleGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'label', sort: 'asc' }}
      procedure={api.courseSuperBundle.list}
    />
  );
};
