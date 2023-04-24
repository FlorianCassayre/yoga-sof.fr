import React from 'react';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';

export const AdminWhitelistGrid: React.FunctionComponent = () => {
  const columns = [
    {
      field: 'email',
      headerName: 'Adresse e-mail',
      minWidth: 250,
      flex: 1,
    },
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.adminWhitelist.findAll} input={undefined} getRowId={({ email }) => email} initialSort={{ field: 'email', sort: 'asc' }} />
  );
};
