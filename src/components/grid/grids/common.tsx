import { Course, User } from '@prisma/client';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { UserLink } from '../../link/UserLink';
import { formatDateDDsMMsYYYYsHHhMMmSSs, formatTimestampRelative } from '../../../common/date';
import { GridValidRowModel } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { displayUserName } from '../../../common/display';
import { Close, Done, QuestionMark } from '@mui/icons-material';
import React from 'react';
import { ChipLink } from '../../ChipLink';
import { GridBaseColDef } from '@mui/x-data-grid/models/colDef/gridColDef';

type PartialGridEnrichedColDef<R extends GridValidRowModel = any> = Pick<GridBaseColDef<R>, 'field'> & Partial<GridBaseColDef<R>>

export const userColumn = <R extends GridValidRowModel = any>(params: PartialGridEnrichedColDef<R>): GridBaseColDef<R, User> => ({
  headerName: 'Utilisateur',
  sortComparator: ((user1, user2) => displayUserName(user1) < displayUserName(user2) ? -1 : 1) satisfies GridComparatorFn<User>,
  renderCell: ({ value }) => !!value && (
    <UserLink user={value} />
  ),
  minWidth: 200,
  ...params,
});

export const usersColumn = <R extends GridValidRowModel = any>(params: PartialGridEnrichedColDef<R>, options?: { excludeUserId?: number }): GridBaseColDef<R, User[]> => ({
  headerName: 'Utilisateurs',
  sortable: false,
  renderCell: ({ value }) => (
    <Stack direction="column">
      {!!value && value.filter(user => !options || user.id !== options.excludeUserId).map(user =>
        <UserLink user={user} key={user.id} />
      )}
    </Stack>
  ),
  minWidth: 200,
  ...params,
});

export const courseColumn = <R extends GridValidRowModel = any>(params: PartialGridEnrichedColDef<R>): GridBaseColDef<R, Course> => ({
  headerName: 'Séance',
  sortComparator: ((course1, course2) => course1.dateStart < course2.dateStart ? -1 : 1) satisfies GridComparatorFn<Course>,
  renderCell: ({ value }) => !!value && (
    <Stack direction="row" gap={1}>
      <CourseLink course={value} />
      <CourseStatusChip course={value} />
    </Stack>
  ),
  minWidth: 600,
  ...params,
});

export const relativeTimestamp = <R extends GridValidRowModel = any>(params: PartialGridEnrichedColDef<R>, compact: boolean = false): GridBaseColDef<R, string> => ({
  renderCell: ({ value }) => !!value && (
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

export const orderColumn = <R extends GridValidRowModel = any>(params: PartialGridEnrichedColDef<R>, options?: { onClickNo?: (data: any) => void }): GridBaseColDef<R, number> => ({
  headerName: 'Payé',
  minWidth: 100,
  renderCell: (data) => {
    const { value: id } = data;
    const commonProps = {
      variant: 'outlined',
    } as const;
    const yesProps = {
      ...commonProps,
      label: 'Oui',
      color: 'success',
      icon: <Done />,
      href: `/administration/paiements/${id}`,
    } as const;
    const noProps = {
      ...commonProps,
      label: 'Non',
      color: 'default',
      icon: <Close />,
    } as const;
    const onClickNo = options?.onClickNo;
    return id !== undefined ? (
      <ChipLink {...yesProps} />
    ) : !onClickNo ? (
      <Chip {...noProps} />
    ) : (
      <Chip {...noProps} onClick={() => onClickNo(data)} />
    );
  },
  ...params,
});

export const simpleOrderColumn = <R extends { paid: boolean }>(params: PartialGridEnrichedColDef<R>): GridBaseColDef<R, boolean> => ({
  headerName: 'Payée',
  minWidth: 150,
  flex: 1,
  valueGetter: ({ row }: { row: { paid: boolean } }) => row.paid,
  renderCell: ({ value }) =>
    <Tooltip title={value ? `L'article a été payé` : `L'article n'a pas encore été payé`}>
      {value ? (
        <Chip label="Oui" color="success" variant="outlined" icon={<Done />} />
      ) : (
        <Chip label="Pas encore" color="default" variant="outlined" icon={<QuestionMark />} />
      )}
    </Tooltip>,
  ...params,
});
