import React, { useState } from 'react';
import { Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { orderColumn, relativeTimestamp, simpleOrderColumn, userColumn } from './common';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { Membership, CourseType, MembershipType } from '@prisma/client';
import {
  Box, Button, Chip,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import { CourseTypeNames } from '../../../common/course';
import { useSnackbar } from 'notistack';
import { displayMembershipName } from '../../../common/display';
import { RouterOutput } from '../../../server/controllers/types';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../../../common/date';
import { MembershipTypeNames } from '../../../common/membership';

interface FrontsiteMembershipGridProps {
  userId: number;
}

export const FrontsiteMembershipGrid: React.FunctionComponent<FrontsiteMembershipGridProps> = ({ userId }) => {
  const today = new Date();
  const todayTime = today.getTime();

  const columns = [
    {
      field: 'status',
      headerName: 'Statut',
      minWidth: 100,
      flex: 1,
      valueGetter: ({ row }: { row: { dateStart: Date, dateEnd: Date } }) => todayTime < row.dateStart.getTime() ? null : row.dateStart.getTime() <= todayTime && todayTime <= row.dateEnd.getTime(),
      renderCell: ({ value }: GridRenderCellParams<{ value: boolean | null }>) => value === null ? (
        <Chip label="Pas encore active" color="default" variant="outlined" />
      ) : value ? (
        <Chip label="Active" color="primary" variant="outlined" />
      ) : (
        <Chip label="Inactive" color="default" variant="outlined" />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 120,
      flex: 1,
      valueFormatter: ({ value }: { value: MembershipType }) => MembershipTypeNames[value],
    },
    {
      field: 'dateStart',
      headerName: 'Début de validité',
      minWidth: 200,
      flex: 1.5,
      valueFormatter: ({ value }: { value: Date }) => formatDateDDsmmYYYY(value),
    },
    {
      field: 'dateEnd',
      headerName: 'Fin de validité',
      minWidth: 200,
      flex: 1.5,
      valueFormatter: ({ value }: { value: Date }) => formatDateDDsmmYYYY(value),
    },
    {
      field: 'otherUsers',
      headerName: 'Autres bénéficiaires',
      sortable: false,
      minWidth: 150,
      flex: 1.5,
      renderCell: ({ value }: { value: { id: number, displayName: string }[] }) => (
        <Stack direction="column">
          {value.map(({ id, displayName }) => <Box key={id}>{displayName}</Box>)}
        </Stack>
      ),
    } as any, // TODO
    simpleOrderColumn({
      field: 'paid',
    }),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.self.findAllMemberships} input={{ userId }} initialSort={{ field: 'dateStart', sort: 'desc' }} />
  );
};
