import React from 'react';
import { Course, User } from '@prisma/client';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box, Stack } from '@mui/material';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { displayCouponName, displayMembershipName } from '../../../common/display';
import { UserLink } from '../../link/UserLink';
import { GridRowIdGetter } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';
import { relativeTimestamp } from './common';

interface UnpaidItemsGridProps {
  userId?: number;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const UnpaidItemsGrid: React.FunctionComponent<UnpaidItemsGridProps> = ({ userId, collapsible, collapsedSummary }) => {
  type Item = RouterOutput['order']['findAllItemsWithNoOrder'][0];

  const getRowId: GridRowIdGetter<Item> = (item: Item): string =>
    item.courseRegistration ? `r${item.courseRegistration.id}`
      : item.coupon ? `c${item.coupon.id}`
        : `m${item.membership.id}`;
  const getItemDate = (item: Item): Date =>
    item.courseRegistration ? item.courseRegistration.createdAt
      : item.coupon ? item.coupon.createdAt
      : item.membership.createdAt;

  const columns: GridColDef<Item>[] = [
    {
      field: 'item',
      headerName: 'Article',
      minWidth: 450,
      flex: 2,
      sortable: false,
      renderCell: ({ row }) =>
        row.courseRegistration ? <CourseLink course={row.courseRegistration.course} />
          : row.coupon ? displayCouponName(row.coupon)
            : displayMembershipName(row.membership),
    },
    ...(userId === undefined ? [{
      field: 'user',
      headerName: 'Utilisateur',
      minWidth: 300,
      flex: 2,
      sortable: false,
      valueGetter: ({ row }: GridValueGetterParams<Item>): User[] =>
        row.courseRegistration ? [row.courseRegistration.user]
          : row.coupon ? [row.coupon.user]
            : row.membership.users,
      renderCell: ({ value }: GridRenderCellParams<Item, User[]>) => (
        <Stack direction="column">
          {value?.map(user => (
            <UserLink key={user.id} user={user} />
          ))}
        </Stack>
      ),
    }] : []),
    relativeTimestamp({
      field: 'date',
      headerName: `Date de création`,
      flex: 1,
      valueGetter: ({ row }) => getItemDate(row),
    }),
  ];

  return (
    <AsyncGrid columns={columns} getRowId={getRowId} procedure={trpc.order.findAllItemsWithNoOrder} input={{ userId }} initialSort={{ field: 'date', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
