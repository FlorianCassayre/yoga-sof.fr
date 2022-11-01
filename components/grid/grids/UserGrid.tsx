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

export const UserGrid: React.FunctionComponent = () => {
  const router = useRouter();

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/utilisateurs/${row.id}`)} />,
      ],
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Edit />} label="Modifier" onClick={() => router.push(`/administration/utilisateurs/${row.id}/edition`)} />,
      ],
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['user.findAll']} />
  );
};
