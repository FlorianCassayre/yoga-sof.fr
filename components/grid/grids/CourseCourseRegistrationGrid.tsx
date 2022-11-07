import React from 'react';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel } from '@mui/icons-material';
import { CourseRegistration } from '@prisma/client';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { courseColumn, relativeTimestamp, userColumn } from './common';

interface CourseCourseRegistrationGridProps {
  courseId: number;
}

export const CourseCourseRegistrationGrid: React.FunctionComponent<CourseCourseRegistrationGridProps> = ({ courseId }) => {
  const columns: GridColumns = [
    userColumn({ field: 'user', flex: 1 }),
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
    <AsyncGrid columns={columns} query={['courseRegistration.findAllForCourse', { courseId, isActive: true }]} />
  );
};
