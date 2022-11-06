import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { User } from '@prisma/client';
import { displayUserName } from '../../../lib/common/newDisplay';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { Person } from '@mui/icons-material';
import { UserLink } from '../../link/UserLink';
import { formatDateDDsMMsYYYsHHhMMmSSs, formatTimestampRelative } from '../../../lib/common/newDate';

type PartialGridEnrichedColDef = Pick<GridEnrichedColDef, 'field'> & Partial<GridEnrichedColDef>

export const userColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Utilisateur',
  renderCell: ({ value }: GridRenderCellParams<User>) => value && (
    <UserLink user={value} />
  ),
  ...params,
});

export const relativeTimestamp = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  renderCell: ({ value }: GridRenderCellParams<string>) => value && (
    <time dateTime={value} title={formatDateDDsMMsYYYsHHhMMmSSs(value)}>
      {formatTimestampRelative(value).toLowerCase()}
    </time>
  ),
  ...params,
});
