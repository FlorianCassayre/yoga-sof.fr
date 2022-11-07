import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Course, CourseRegistration, User } from '@prisma/client';
import { displayUserName } from '../../../lib/common/newDisplay';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { Person } from '@mui/icons-material';
import { UserLink } from '../../link/UserLink';
import { formatDateDDsMMsYYYsHHhMMmSSs, formatTimestampRelative } from '../../../lib/common/newDate';
import { GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';

type PartialGridEnrichedColDef<R extends GridValidRowModel = any> = Pick<GridEnrichedColDef<R>, 'field'> & Partial<GridEnrichedColDef<R>>

export const userColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Utilisateur',
  renderCell: ({ value }: GridRenderCellParams<User>) => value && (
    <UserLink user={value} />
  ),
  ...params,
});

export const courseColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Séance',
  renderCell: ({ value }: GridRenderCellParams<Course>) => value && (
    <CourseLink course={value} />
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
