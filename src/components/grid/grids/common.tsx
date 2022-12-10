import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { Course, User } from '@prisma/client';
import { Box, Stack } from '@mui/material';
import { UserLink } from '../../link/UserLink';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatTimeHHhMM, formatTimestampRelative } from '../../../common/date';
import { GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { displayUserName } from '../../../common/display';

type PartialGridEnrichedColDef<R extends GridValidRowModel = any> = Pick<GridEnrichedColDef<R>, 'field'> & Partial<GridEnrichedColDef<R>>

export const userColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Utilisateur',
  sortComparator: ((user1, user2) => displayUserName(user1) < displayUserName(user2) ? -1 : 1) as GridComparatorFn<User>,
  renderCell: ({ value }: GridRenderCellParams<User>) => value && (
    <UserLink user={value} />
  ),
  minWidth: 200,
  ...params,
});

export const courseColumn = (params: PartialGridEnrichedColDef): GridEnrichedColDef => ({
  headerName: 'Séance',
  sortComparator: ((course1, course2) => course1.dateStart < course2.dateStart ? -1 : 1) as GridComparatorFn<Course>,
  renderCell: ({ value }: GridRenderCellParams<Course>) => value && (
    <Stack direction="row" gap={1}>
      <CourseLink course={value} />
      <CourseStatusChip course={value} />
    </Stack>
  ),
  minWidth: 600,
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