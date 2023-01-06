import React from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Edit, Visibility } from '@mui/icons-material';
import { User } from '@prisma/client';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { relativeTimestamp } from './common';
import { displayUserEmail, displayUserName } from '../../../common/display';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';

// TODO
/*
render: ({ accounts, emailVerified }) => {
              const allAccounts = [...(emailVerified ? [{ provider: 'email' }] : []), ...accounts];

              return (allAccounts.length > 0 ? (
                allAccounts.map(({ provider }) => {
                  const { icon: Icon, name: providerName } = providersData[provider];
                  return <Icon key={provider} className="icon mx-1" title={providerName} />;
                })
              ) : (
                <>(aucun)</>
              ));
            },
 */

export const UserGrid: React.FunctionComponent = () => {
  const router = useRouter();

  const columns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/utilisateurs/${row.id}`)} />,
      ],
    },
    {
      field: 'name',
      headerName: 'Nom',
      minWidth: 200,
      flex: 1,
      valueGetter: ({ row }: { row: User }) => displayUserName(row),
    },
    {
      field: 'email',
      headerName: 'Addresse e-mail',
      minWidth: 250,
      flex: 1.5,
      valueGetter: ({ row }: { row: User }) => displayUserEmail(row),
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: 'Date de création',
      flex: 1,
    }),
    relativeTimestamp({
      field: 'lastActivity',
      headerName: 'Dernière activité',
      flex: 1,
    }),
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItemTooltip icon={<Edit />} label="Modifier" onClick={() => router.push(`/administration/utilisateurs/${row.id}/edition`)} />,
      ],
    },
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.user.findAll} input={undefined} initialSort={{ field: 'lastActivity', sort: 'desc' }} />
  );
};
