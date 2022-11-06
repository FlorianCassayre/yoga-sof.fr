import React from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Edit, Visibility } from '@mui/icons-material';
import { User } from '@prisma/client';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { relativeTimestamp } from './common';
import { displayUserEmail, displayUserName } from '../../../lib/common/newDisplay';

export const UserGrid: React.FunctionComponent = () => {
  const router = useRouter();

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/utilisateurs/${row.id}`)} />,
      ],
    },
    {
      field: 'name',
      headerName: 'Nom',
      renderCell: ({ row }: { row: User }) => displayUserName(row),
    },
    {
      field: 'email',
      headerName: 'Addresse e-mail',
      renderCell: ({ row }: { row: User }) => displayUserEmail(row),
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: 'Date de création',
    }),
    relativeTimestamp({
      field: 'lastActivity',
      headerName: 'Dernière activité',
    }),
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Edit />} label="Modifier" onClick={() => router.push(`/administration/utilisateurs/${row.id}/edition`)} />,
      ],
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['user.findAll']} />
  );
};
