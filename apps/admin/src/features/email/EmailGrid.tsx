'use client';

import { IconButton } from '@mui/material';
import { EMAIL_TYPE_LABELS } from '@yoga-sof/core';
import { Eye } from 'lucide-react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';

type EmailRow = RouterOutputs['email']['list']['rows'][number];

const columns: GridColumns<EmailRow> = [
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    renderCell: (params) => (
      <IconButton component={Link} href={`/emails/${params.row.id}`} size="small">
        <Eye size={18} />
      </IconButton>
    ),
  },
  {
    field: 'type',
    headerName: 'Type',
    flex: 1.5,
    valueFormatter: (value) => EMAIL_TYPE_LABELS[value],
  },
  {
    field: 'userName',
    headerName: 'Destinataire',
    flex: 2,
    renderCell: (params) => <PersonLink person={params.row} />,
  },
  {
    field: 'subject',
    headerName: 'Sujet',
    flex: 3,
  },
  {
    field: 'createdAt',
    headerName: 'Créé le',
    type: 'dateTime',
    flex: 1.5,
    renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
  },
  {
    field: 'sentAt',
    headerName: 'Envoyé le',
    type: 'dateTime',
    flex: 1.5,
    renderCell: (params) => <DateTimeCell value={params.row.sentAt} />,
  },
];

interface EmailGridProps {
  userId?: string;
}

export const EmailGrid = ({ userId }: EmailGridProps) => {
  const scopedColumns =
    userId === undefined ? columns : columns.filter((column) => column.field !== 'userName');

  return (
    <DataGrid
      columns={scopedColumns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.email.list}
      listInput={{ userId }}
    />
  );
};
