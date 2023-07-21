import React from 'react';
import { Edit, Visibility } from '@mui/icons-material';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { relativeTimestamp } from './common';
import { displayUserEmail, displayUserName } from '../../../common/display';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { useBackofficeWritePermission } from '../../hooks/usePermission';

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

interface UserGridProps {
  disabledUsers?: boolean;
  collapsible?: boolean;
  collapsedSummary?: React.ReactNode;
}

export const UserGrid: React.FunctionComponent<UserGridProps> = ({ disabledUsers, collapsible, collapsedSummary }) => {
  const hasWritePermission = useBackofficeWritePermission();
  const router = useRouter();

  type UserItem = RouterOutput['user']['findAll'][0];
  const columns: GridColDef<UserItem>[] = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams<UserItem>) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" href={{ pathname: '/administration/utilisateurs/[id]', query: { id: row.id } }} />,
      ],
    },
    {
      field: 'name',
      headerName: 'Nom',
      minWidth: 200,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<UserItem>) => displayUserName(row),
    },
    {
      field: 'email',
      headerName: 'Addresse e-mail',
      minWidth: 250,
      flex: 1.5,
      valueGetter: ({ row }: GridValueGetterParams<UserItem>) => displayUserEmail(row),
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
    ...(hasWritePermission ? [{
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<UserItem>) => [
        <GridActionsCellItemTooltip icon={<Edit />} label="Modifier" href={{ pathname: '/administration/utilisateurs/[id]/edition', query: { id: row.id, redirect: router.asPath } }} />,
      ],
    } satisfies GridColDef<UserItem>] : []),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.user.findAll} input={{ disabled: disabledUsers }} initialSort={{ field: 'lastActivity', sort: 'desc' }} collapsible={collapsible} collapsedSummary={collapsedSummary} />
  );
};
