import React from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import { Cancel, Edit, Visibility } from '@mui/icons-material';
import { formatDateDDsMMsYYYY } from '../../../lib/common/newDate';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/newCourse';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';
import { userColumn } from './common';

export const CourseRegistrationGrid: React.FunctionComponent = () => {
  const router = useRouter();

  const columns: GridColumns = [
    userColumn({ field: 'user' }),
    {
      field: 'createdAt',
      headerName: `Date d'inscription`,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Cancel />} onClick={() => null} label="Annuler" />,
      ],
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['courseRegistration.findAll']} />
  );
};
