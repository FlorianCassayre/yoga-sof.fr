import React, { useState } from 'react';
import { Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { orderColumn, relativeTimestamp, simpleOrderColumn, userColumn } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { Coupon, CourseType } from '@prisma/client';
import {
  Box, Button,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import { CourseTypeNames } from '../../../common/course';
import { useSnackbar } from 'notistack';
import { displayCouponName } from '../../../common/display';
import { RouterOutput } from '../../../server/controllers/types';

interface FrontsiteCouponGridProps {
  userId: number;
}

export const FrontsiteCouponGrid: React.FunctionComponent<FrontsiteCouponGridProps> = ({ userId }) => {
  const columns = [
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }: GridRenderCellParams<Coupon['code']>) => value && (
        <Box sx={{ fontFamily: 'monospace' }}>{value}</Box>
      ),
    },
    {
      field: 'courseType',
      headerName: 'Type de séance',
      minWidth: 150,
      flex: 1,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'quantity',
      headerName: 'Séances restantes',
      flex: 1,
      minWidth: 150,
      valueGetter: ({ row }: { row: RouterOutput['self']['findAllCoupons'][0] }) => [row.quantity, row.remaining],
      renderCell: ({ value: [quantity, remaining] }: { value: [number, number] }) => (
        <Box>
          <Box display="inline" color={remaining > 3 ? 'green' : remaining > 0 ? 'orange' : 'red'}>{remaining}</Box>
          {' / '}
          <Box display="inline">{quantity}</Box>
        </Box>
      )
    } as any,
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
