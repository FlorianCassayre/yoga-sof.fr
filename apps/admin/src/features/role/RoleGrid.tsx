'use client';

import { Link } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { ROLE_TYPE_LABELS } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type RoleRow = RouterOutputs['role']['list']['rows'][number];

const columns: GridColDef<RoleRow>[] = [
  {
    field: 'userName',
    headerName: 'Utilisateur',
    flex: 1,
    renderCell: (params) => (
      <Link href={`/utilisateurs/${params.row.id}`}>{params.row.userName ?? '-'}</Link>
    ),
  },
  {
    field: 'role',
    headerName: 'Rôle',
    flex: 1,
    renderCell: (params) => ROLE_TYPE_LABELS[params.row.role],
  },
];

export const RoleGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'userName', sort: 'asc' }}
      procedure={api.role.list}
    />
  );
};
