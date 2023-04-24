import React from 'react';
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { simpleOrderColumn } from './common';
import { trpc } from '../../../common/trpc';
import { MembershipType } from '@prisma/client';
import {
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { RouterOutput } from '../../../server/controllers/types';
import { formatDateDDsmmYYYY } from '../../../common/date';
import { MembershipTypeNames } from '../../../common/membership';
import { GridValueFormatterParams } from '@mui/x-data-grid/models/params/gridCellParams';

interface FrontsiteMembershipGridProps {
  userId: number;
}

export const FrontsiteMembershipGrid: React.FunctionComponent<FrontsiteMembershipGridProps> = ({ userId }) => {
  const today = new Date();
  const todayTime = today.getTime();

  type MembershipItem = RouterOutput['self']['findAllMemberships'][0];
  const columns: GridColDef<MembershipItem>[] = [
    {
      field: 'status',
      headerName: 'Statut',
      minWidth: 100,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<MembershipItem>): boolean | null => todayTime < row.dateStart.getTime() ? null : row.dateStart.getTime() <= todayTime && todayTime <= row.dateEnd.getTime(),
      renderCell: ({ value }: GridRenderCellParams<MembershipItem, boolean | null>) => value === null ? (
        <Chip label="Pas encore active" color="default" variant="outlined" />
      ) : value ? (
        <Chip label="Active" color="primary" variant="outlined" />
      ) : (
        <Chip label="Inactive" color="default" variant="outlined" />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 120,
      flex: 1,
      valueFormatter: ({ value }: GridValueFormatterParams<MembershipType>) => MembershipTypeNames[value],
    },
    {
      field: 'dateStart',
      headerName: 'Début de validité',
      minWidth: 200,
      flex: 1.5,
      valueFormatter: ({ value }: GridValueFormatterParams<Date>) => formatDateDDsmmYYYY(value),
    },
    {
      field: 'dateEnd',
      headerName: 'Fin de validité',
      minWidth: 200,
      flex: 1.5,
      valueFormatter: ({ value }: GridValueFormatterParams<Date>) => formatDateDDsmmYYYY(value),
    },
    {
      field: 'otherUsers',
      headerName: 'Autres bénéficiaires',
      sortable: false,
      minWidth: 150,
      flex: 1.5,
      renderCell: ({ value }: GridRenderCellParams<MembershipItem, MembershipItem['otherUsers']>) => !!value && (
        <Stack direction="column">
          {value.map(({ id, displayName }) => <Box key={id}>{displayName}</Box>)}
        </Stack>
      ),
    },
    simpleOrderColumn({
      field: 'paid',
    }),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.self.findAllMemberships} input={{ userId }} initialSort={{ field: 'dateStart', sort: 'desc' }} />
  );
};
