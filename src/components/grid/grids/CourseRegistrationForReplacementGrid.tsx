import React from 'react';
import { Course } from '@prisma/client';
import { GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { trpc } from '../../../common/trpc';
import { GridComparatorFn } from '@mui/x-data-grid/models/gridSortModel';
import { RouterOutput } from '../../../server/controllers/types';
import { CourseLink } from '../../link/CourseLink';
import { relativeTimestamp, userColumn } from './common';

interface CourseRegistrationForReplacementGridProps {
  userId?: number;
}

export const CourseRegistrationForReplacementGrid: React.FunctionComponent<CourseRegistrationForReplacementGridProps> = ({ userId }) => {
  type CourseRegistrationItem = RouterOutput['courseRegistration']['findAllForReplacement'][0];
  const columns: GridColDef<CourseRegistrationItem>[] = [
    ...(userId === undefined ? [userColumn({ field: 'user', headerName: 'Utilisateur', flex: 1 })] : []),
    {
      field: 'course',
      headerName: 'Séance',
      flex: 2,
      sortComparator: ((course1, course2) => course1.dateStart < course2.dateStart ? -1 : 1) satisfies GridComparatorFn<Course>,
      renderCell: ({ value }: GridRenderCellParams<CourseRegistrationItem, Course>) => !!value && (
        <CourseLink course={value} />
      ),
      minWidth: 600,
    },
    {
      field: 'reason',
      headerName: 'Motif',
      minWidth: 150,
      flex: 1,
      valueGetter: ({ row }: GridValueGetterParams<CourseRegistrationItem>) => row.isUserCanceled,
      renderCell: ({ value }: GridRenderCellParams<CourseRegistrationItem, boolean>) => value ? `Inscription annulée` : `Séance annulée`,
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
