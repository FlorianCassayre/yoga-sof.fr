import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Course, User } from '@prisma/client';
import { Box, Stack } from '@mui/material';
import { UserLink } from '../../link/UserLink';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatTimestampRelative } from '../../../lib/common/newDate';
import { GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';
import { CourseStatusChip } from '../../CourseStatusChip';

type PartialGridEnrichedColDef<R extends GridValidRowModel = any> = Pick<GridEnrichedColDef<R>, 'field'> & Partial<GridEnrichedColDef<R>>

export const userColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Utilisateur',
  renderCell: ({ value }: GridRenderCellParams<User>) => value && (
    <UserLink user={value} />
  ),
  minWidth: 150,
  ...params,
});

export const courseColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Séance',
  renderCell: ({ value }: GridRenderCellParams<Course>) => value && (
    <Stack direction="row" gap={1}>
      <CourseLink course={value} />
      <CourseStatusChip course={value} />
    </Stack>
  ),
  minWidth: 560,
  ...params,
});

export const relativeTimestamp = (params: PartialGridEnrichedColDef, compact: boolean = false): GridEnrichedColDef => ({
  renderCell: ({ value }: GridRenderCellParams<string>) => value && (
    <time dateTime={value}>
      {formatTimestampRelative(value)}
      {!compact && (
        <Box sx={{ color: 'text.disabled' }}>
          {formatDateDDsMMsYYYYsHHhMMmSSs(value, true)}
        </Box>
      )}
    </time>
  ),
  minWidth: 185,
  ...params,
});
