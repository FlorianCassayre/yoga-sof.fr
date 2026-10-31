'use client';

import { Link } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { formatMembershipPeriod, formatPrice, MEMBERSHIP_TYPE_LABELS } from '@yoga-sof/core';
import { Fragment } from 'react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';

type MembershipRow = RouterOutputs['membership']['list']['rows'][number];

const COLUMNS: GridColDef<MembershipRow>[] = [
  {
    field: 'type',
    headerName: "Type d'adhésion",
    flex: 1,
    valueFormatter: (value) => MEMBERSHIP_TYPE_LABELS[value],
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
          <Link href={`/utilisateurs/${beneficiary.userId}`}>{beneficiary.userName ?? '-'}</Link>
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
