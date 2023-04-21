import React, { useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, Edit, Notes, Visibility } from '@mui/icons-material';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../../../common/date';
import { Course, CourseType, Prisma, User } from '@prisma/client';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../common/course';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box, Stack } from '@mui/material';
import { CancelCourseDialog } from '../../CancelCourseDialog';
import { trpc } from '../../../common/trpc';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { RouterOutput } from '../../../server/controllers/types';
import { displayCouponName, displayCourseName, displayMembershipName, displayUserName } from '../../../common/display';
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
  const router = useRouter();

  type Item = RouterOutput['order']['findAllItemsWithNoOrder'][0];

  const getRowId: GridRowIdGetter<Item> = (item: Item): string =>
    item.courseRegistration ? `r${item.courseRegistration.id}`
      : item.coupon ? `c${item.coupon.id}`
        : `m${item.membership.id}`;
  const getItemDate = (item: Item): Date =>
    item.courseRegistration ? item.courseRegistration.createdAt
      : item.coupon ? item.coupon.createdAt
      : item.membership.createdAt;

  const columns: GridColumns = [
    {
      field: 'item',
      headerName: 'Article',
      minWidth: 450,
      flex: 2,
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<unknown, Item>) =>
        row.courseRegistration ? <CourseLink course={(row.courseRegistration as any as { course: Course }).course} /> // TODO: why is the type lost!?
          : row.coupon ? displayCouponName(row.coupon)
            : displayMembershipName(row.membership),
    },
    ...(userId === undefined ? [{
      field: 'user',
      headerName: 'Utilisateur',
      minWidth: 300,
      flex: 2,
      sortable: false,
      valueGetter: ({ row }: GridRenderCellParams<unknown, Item>): User[] =>
        row.courseRegistration ? [(row.courseRegistration as any as { user: User }).user]
          : row.coupon ? [(row.coupon as any as { user: User }).user]
            : (row.membership as any as { users: User[] }).users,
      renderCell: ({ value }: GridRenderCellParams<User[]>) => (
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
      valueGetter: ({ row }: { row: Item }) => getItemDate(row),
    }),
  ];

  return (
    <AsyncGrid columns={columns} getRowId={getRowId as any} procedure={trpc.order.findAllItemsWithNoOrder} input={{ userId }} initialSort={{ field: 'date', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
