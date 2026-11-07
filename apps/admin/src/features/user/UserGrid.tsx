'use client';

import { DataGrid } from '../../components/grid/DataGrid';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from './PersonLink';

type UserRow = RouterOutputs['user']['list']['rows'][number];

const columns: GridColumns<UserRow> = [
  {
    field: 'name',
    headerName: 'Nom',
    flex: 1,
    renderCell: (params) => (
      <PersonLink person={{ userId: params.row.id, userName: params.row.name }} />
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
