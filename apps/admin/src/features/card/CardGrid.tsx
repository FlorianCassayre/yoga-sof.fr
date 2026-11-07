'use client';

import { IconButton } from '@mui/material';
import { COURSE_TYPE_LABELS, formatPrice, getCardStatus } from '@yoga-sof/core';
import { Eye } from 'lucide-react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';
import { formatValidUntil } from './formatValidUntil';
import { CardStatusChip } from './status/CardStatusChip';

type CardRow = RouterOutputs['card']['list']['rows'][number];

const columns: GridColumns<CardRow, 'status'> = [
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    renderCell: (params) => (
      <IconButton component={Link} href={`/cartes/${params.row.id}`} size="small">
        <Eye size={18} />
      </IconButton>
    ),
  },
  {
    field: 'userName',
    headerName: 'Titulaire',
    flex: 2,
    renderCell: (params) => <PersonLink person={params.row} />,
  },
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    valueFormatter: (value) => COURSE_TYPE_LABELS[value],
  },
  {
    field: 'status',
    headerName: 'Statut',
    sortable: false,
    flex: 1,
    renderCell: (params) => <CardStatusChip size="small" status={getCardStatus(params.row)} />,
  },
  {
    field: 'remaining',
    headerName: 'Séances restantes',
    type: 'number',
    flex: 1,
    renderCell: (params) => `${params.row.remaining} / ${params.row.count}`,
  },
  {
    field: 'price',
    headerName: 'Prix',
    type: 'number',
    flex: 1,
    valueFormatter: (value) => formatPrice(value),
  },
  {
    field: 'validUntil',
    headerName: "Valable jusqu'au",
    flex: 2,
    renderCell: (params) => formatValidUntil(params.row.validUntil),
  },
  {
    field: 'createdAt',
    headerName: "Date d'émission",
    type: 'dateTime',
    flex: 1.5,
    renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
  },
];

interface CardGridProps {
  userId?: string;
}

export const CardGrid = ({ userId }: CardGridProps) => {
  const scopedColumns =
    userId === undefined ? columns : columns.filter((column) => column.field !== 'userName');

  return (
    <DataGrid
      columns={scopedColumns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.card.list}
      listInput={{ userId }}
    />
  );
};
