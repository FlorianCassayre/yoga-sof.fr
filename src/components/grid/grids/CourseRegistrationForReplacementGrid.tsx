import React, { useState } from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, Edit, Notes, Visibility } from '@mui/icons-material';
import { formatDateDDsmmYYYY, formatTimeHHhMM, formatWeekday } from '../../../common/date';
import { Course, CourseRegistration, CourseType, Prisma, User } from '@prisma/client';
import { CourseTypeNames, getCourseStatusWithRegistrations } from '../../../common/course';
import { GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { CourseStatusChip } from '../../CourseStatusChip';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Box, Stack } from '@mui/material';
import { CancelCourseDialog } from '../../CancelCourseDialog';
import { trpc } from '../../../common/trpc';
import { useSnackbar } from 'notistack';
import { GridActionsCellItemTooltip } from '../../GridActionsCellItemTooltip';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { RouterOutput } from '../../../server/controllers/types';
import { displayCouponName, displayCourseName, displayMembershipName, displayUserName } from '../../../common/display';
import { UserLink } from '../../link/UserLink';
import { GridRowIdGetter } from '@mui/x-data-grid/models/gridRows';
import { CourseLink } from '../../link/CourseLink';
import { relativeTimestamp, userColumn } from './common';

interface CourseRegistrationForReplacementGridProps {
  userId?: number;
}

export const CourseRegistrationForReplacementGrid: React.FunctionComponent<CourseRegistrationForReplacementGridProps> = ({ userId }) => {
  const router = useRouter();

  type CourseRegistrationItem = CourseRegistration & { user: User, course: Course };

  const columns: GridColumns = [
    ...(userId === undefined ? [userColumn({ field: 'user', headerName: 'Utilisateur', flex: 1 })] : []),
    {
      field: 'course',
      headerName: 'Séance',
      flex: 2,
      sortComparator: ((course1, course2) => course1.dateStart < course2.dateStart ? -1 : 1) as GridComparatorFn<Course>,
      renderCell: ({ value }: GridRenderCellParams<Course>) => value && (
        <CourseLink course={value} />
      ),
      minWidth: 600,
    },
    {
      field: 'reason',
      headerName: 'Motif',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row }: { row: CourseRegistrationItem }) => row.isUserCanceled,
      renderCell: ({ value }: GridRenderCellParams<boolean>) => value ? `Inscription annulée` : `Séance annulée`,
    },
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date d'inscription`,
      flex: 1,
    }),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.courseRegistration.findAllForReplacement} input={{ userId }} initialSort={{ field: 'createdAt', sort: 'desc' }} />
  );
};
