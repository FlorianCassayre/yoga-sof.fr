import React from 'react';
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { relativeTimestamp, simpleOrderColumn } from './common';
import { trpc } from '../../../common/trpc';
import { CourseType } from '@prisma/client';
import {
  Box,
} from '@mui/material';
import { CourseTypeNames } from '../../../common/course';
import { RouterOutput } from '../../../server/controllers/types';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';

interface FrontsiteCouponGridProps {
  userId: number;
}

export const FrontsiteCouponGrid: React.FunctionComponent<FrontsiteCouponGridProps> = ({ userId }) => {
  type CouponItem = RouterOutput['self']['findAllCoupons'][0];
  const columns: GridColDef<CouponItem>[] = [
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }: GridRenderCellParams<CouponItem, string>) => value && (
        <Box sx={{ fontFamily: 'monospace' }}>{value}</Box>
      ),
    },
    {
      field: 'courseType',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<CourseType>) => CourseTypeNames[value],
    },
    {
      field: 'quantity',
      headerName: 'Séances restantes',
      flex: 1,
      minWidth: 150,
      valueGetter: ({ row }: GridValueGetterParams<CouponItem>): [number, number] => [row.quantity, row.remaining],
      sortComparator: (([_1, v1], [_2, v2]) => v1 - v2) satisfies GridComparatorFn<[number, number]>,
      renderCell: ({ value }: GridRenderCellParams<CouponItem, [number, number]>) => {
        if (value !== undefined) {
          const [quantity, remaining] = value;
          return (
            <Box>
              <Box display="inline" color={remaining > 3 ? 'green' : remaining > 0 ? 'orange' : 'red'}>{remaining}</Box>
              {' / '}
              <Box display="inline">{quantity}</Box>
            </Box>
          );
        } else {
          return undefined;
        }
      }
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date d'émission`,
      flex: 1,
    }),
    simpleOrderColumn({
      field: 'paid',
    }),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.self.findAllCoupons} input={{ userId }} initialSort={{ field: 'createdAt', sort: 'desc' }} />
  );
};
