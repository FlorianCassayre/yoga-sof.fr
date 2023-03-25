import React, { useState } from 'react';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { userColumn } from './common';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { TransactionTypeNames } from '../../../common/transaction';
import { TransactionType } from '@prisma/client';
import { GridRowParams } from '@mui/x-data-grid';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Visibility } from '@mui/icons-material';
import { useRouter } from 'next/router';

interface OrderGridProps {
  userId?: number;
}

export const OrderGrid: React.FunctionComponent<OrderGridProps> = ({ userId }) => {
  const router = useRouter();

  const columns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/paiements/commandes/${row.id}`)} />,
      ],
    },
    ...(userId === undefined ? [userColumn({
      field: 'user',
      flex: 1,
    })] : []),
    {
      field: 'payment.amount',
      headerName: 'Montant payé',
      valueFormatter: ({ value }: { value: number | undefined }) => `${value ?? 0} €`,
      minWidth: 100,
      flex: 1,
    },
    {
      field: 'payment.type',
      headerName: 'Moyen de paiement',
      valueFormatter: ({ value }: { value: TransactionType | undefined }) => value !== undefined ? TransactionTypeNames[value] : undefined,
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Date de la commande',
      valueFormatter: ({ value }: { value: Date }) => formatDateDDsmmYYYY(value),
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'notes',
      headerName: 'Commentaires',
      minWidth: 500,
      flex: 1,
    },
  ];

  return (
    <AsyncGrid
      columns={columns}
      procedure={trpc.order.findAll}
      input={{ userId }}
      initialSort={{ field: 'date', sort: 'asc' }}
    />
  );
};
