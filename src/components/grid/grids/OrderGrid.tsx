import React from 'react';
import { AsyncGrid } from '../AsyncGrid';
import { trpc } from '../../../common/trpc';
import { relativeTimestamp, userColumn } from './common';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { TransactionTypeNames } from '../../../common/transaction';
import { TransactionType } from '@prisma/client';
import { GridColDef, GridRowParams, GridValueGetterParams } from '@mui/x-data-grid';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { Edit, Visibility } from '@mui/icons-material';
import { RouterOutput } from '../../../server/controllers/types';
import { GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { PaymentRecipientNames } from '../../../common/payment';

interface OrderGridProps {
  userId?: number;
}

export const OrderGrid: React.FunctionComponent<OrderGridProps> = ({ userId }) => {
  type OrderItem = RouterOutput['order']['findAll'][0];
  const columns: GridColDef<OrderItem>[] = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams<OrderItem>) => [
        <GridActionsCellItemTooltip icon={<Visibility />} label="Consulter" href={{ pathname: '/administration/paiements/[id]', query: { id: row.id } }} />,
      ],
    },
    ...(userId === undefined ? [userColumn({
      field: 'user',
      flex: 1,
    })] : []),
    {
      field: 'articles',
      headerName: 'Articles',
      renderCell: ({ row }: GridRenderCellParams<OrderItem>) => {
        if (row === undefined) {
          return undefined;
        }
        const totalCourses = row.usedCouponCourseRegistrations.length + row.trialCourseRegistrations.length + row.replacementCourseRegistrations.length + row.purchasedCourseRegistrations.length;
        const totalCoupons = row.purchasedCoupons.length;
        const totalMemberships = row.purchasedMemberships.length;
        const categories: [number, string][] = [[totalMemberships, 'adhésion'], [totalCoupons, 'carte'], [totalCourses, 'séance']];
        return categories.filter(([count]) => count > 0).map(([count, name]) => `${count} ${name}${count > 1 ? 's' : ''}`).join(', ');
      },
      minWidth: 150,
      flex: 1.5,
    },
    {
      field: 'payment.recipient',
      headerName: 'Bénéficiaire',
      valueGetter: ({ row: { payment } }: GridValueGetterParams<OrderItem>): string | null => payment !== null ? PaymentRecipientNames[payment.recipient] : null,
    },
    {
      field: 'payment.amount',
      headerName: 'Montant payé',
      valueGetter: ({ row: { payment } }: GridValueGetterParams<OrderItem>): number | null => payment?.amount ?? null,
      valueFormatter: ({ value }: GridValueFormatterParams<number | null>) => `${value ?? 0} €`,
      minWidth: 100,
      flex: 1,
    },
    {
      field: 'payment.type',
      headerName: 'Moyen de paiement',
      valueGetter: ({ row: { payment } }: GridValueGetterParams<OrderItem>): TransactionType | null => payment?.type ?? null,
      valueFormatter: ({ value }: GridValueFormatterParams<TransactionType | null>) => value !== null ? TransactionTypeNames[value] : undefined,
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'date',
      headerName: 'Date du paiement',
      valueFormatter: ({ value }: GridValueFormatterParams<Date>) => formatDateDDsmmYYYY(value),
      minWidth: 200,
      flex: 1,
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date de création`,
      flex: 1,
    }),
    {
      field: 'notes',
      headerName: 'Notes',
      minWidth: 300,
      flex: 2,
    },
    {
      field: 'actions',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams<OrderItem>) => [
        <GridActionsCellItemTooltip icon={<Edit />} label="Modifier" href={{ pathname: '/administration/paiements/[id]/edition', query: { id: row.id } }} />,
      ],
    },
  ];

  return (
    <AsyncGrid
      columns={columns}
      procedure={trpc.order.findAll}
      input={{ userId }}
      initialSort={{ field: 'createdAt', sort: 'desc' }}
    />
  );
};
