'use client';

import { ROLE_TYPE_LABELS } from '@yoga-sof/core';

import { DataGrid } from '../../components/grid/DataGrid';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';

type RoleRow = RouterOutputs['role']['list']['rows'][number];

const columns: GridColumns<RoleRow> = [
  {
    field: 'userName',
    headerName: 'Utilisateur',
    flex: 1,
    renderCell: (params) => <PersonLink person={params.row} />,
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
