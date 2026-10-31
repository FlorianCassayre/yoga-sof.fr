'use client';

import { Link } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';

import { DataGrid } from '../../components/grid/DataGrid';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type UserRow = RouterOutputs['user']['list']['rows'][number];

const columns: GridColDef<UserRow>[] = [
  {
    field: 'name',
    headerName: 'Nom',
    flex: 1,
    renderCell: (params) => (
      <Link href={`/utilisateurs/${params.row.id}`}>{params.row.name ?? '-'}</Link>
    ),
  },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'emailVerified', headerName: 'Vérifié', type: 'boolean', width: 110 },
];

export const UserGrid = () => {
  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'name', sort: 'asc' }}
      procedure={api.user.list}
    />
  );
};
