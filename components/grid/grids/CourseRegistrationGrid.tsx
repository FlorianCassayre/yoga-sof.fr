import React from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, Login, Logout } from '@mui/icons-material';
import { CourseRegistration } from '@prisma/client';
import { GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { Tooltip } from '@mui/material';

interface CourseRegistrationGridProps {
  courseId?: number;
  userId?: number;
}

export const CourseRegistrationGrid: React.FunctionComponent<CourseRegistrationGridProps> = ({ courseId, userId }) => {
  const columns: GridColumns = [
    ...(userId !== undefined ? [] : [userColumn({ field: 'user', flex: 1 })]),
    ...(courseId !== undefined ? [] : [courseColumn({ field: 'course', flex: 1 })]),
    relativeTimestamp({ field: 'createdAt', headerName: `Date d'inscription`, flex: 1 }),
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams<CourseRegistration>) => !row.isUserCanceled ? [ // TODO
        <GridActionsCellItem icon={<Cancel />} onClick={() => null} label="Annuler" />,
      ] : [],
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['courseRegistration.findAllActive', { courseId, userId }]} />
  );
};
