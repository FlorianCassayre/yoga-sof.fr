import React from 'react';
import { Edit, Visibility } from '@mui/icons-material';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { relativeTimestamp, userColumn } from './common';
import { displayUserEmail, displayUserName } from '../../../common/display';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { useBackofficeWritePermission } from '../../hooks/usePermission';
import { GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { UserRole } from '@prisma/client';
import { RoleNames } from '../../../common/role';

export const UserRoleGrid: React.FunctionComponent = () => {
  type UserItem = RouterOutput['user']['findAll'][0];
  const columns: GridColDef<UserItem>[] = [
    userColumn({
      field: 'user',
      valueGetter: ({ row }: GridValueGetterParams<UserItem>) => row,
    }),
    {
      field: 'role',
      headerName: 'Rôle',
      valueFormatter: ({ value }: GridValueFormatterParams<UserRole>) => RoleNames[value],
      minWidth: 150,
      flex: 1,
    },
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.user.findAll} input={{ role: true }} initialSort={{ field: 'role', sort: 'asc' }} />
  );
};
