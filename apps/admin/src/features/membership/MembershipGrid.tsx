'use client';

import { IconButton } from '@mui/material';
import { formatMembershipPeriod, formatPrice } from '@yoga-sof/core';
import { Eye } from 'lucide-react';
import { Fragment } from 'react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { Link } from '../../components/link/Link';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { PersonLink } from '../user/PersonLink';
import { MembershipTypeChip } from './type/MembershipTypeChip';

type MembershipRow = RouterOutputs['membership']['list']['rows'][number];

const COLUMNS: GridColumns<MembershipRow> = [
  {
    field: 'actions',
    headerName: '',
    width: 70,
    sortable: false,
    renderCell: (params) => (
      <IconButton component={Link} href={`/adhesions/${params.row.id}`} size="small">
        <Eye size={18} />
      </IconButton>
    ),
  },
  {
    field: 'type',
    headerName: "Type d'adhésion",
    flex: 1,
    renderCell: (params) => <MembershipTypeChip type={params.row.type} size="small" />,
  },
  {
    field: 'startsAt',
    headerName: 'Période',
    flex: 2,
    renderCell: (params) => formatMembershipPeriod(params.row),
  },
  {
    field: 'beneficiaries',
    headerName: 'Bénéficiaires',
    flex: 2,
    sortable: false,
    renderCell: (params) =>
      params.row.beneficiaries.map((beneficiary, index) => (
        <Fragment key={beneficiary.userId}>
          {index > 0 && ', '}
          <PersonLink person={beneficiary} />
        </Fragment>
      )),
  },
  {
    field: 'price',
    headerName: "Prix d'achat",
    type: 'number',
    flex: 1,
    valueFormatter: (value) => formatPrice(value),
  },
  {
    field: 'createdAt',
    headerName: "Date d'émission",
    type: 'dateTime',
    flex: 1,
    renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
  },
];

interface MembershipGridProps {
  userId?: string;
}

export const MembershipGrid = ({ userId }: MembershipGridProps) => {
  const columns =
    userId === undefined ? COLUMNS : COLUMNS.filter((column) => column.field !== 'beneficiaries');

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.membership.list}
      listInput={{ userId }}
    />
  );
};
