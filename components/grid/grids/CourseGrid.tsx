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

interface CourseGridProps {
  readOnly?: boolean;
}

export const CourseGrid: React.FunctionComponent<CourseGridProps> = ({ readOnly }) => {
  const router = useRouter();

  const columns: GridColumns = [
    {
      field: 'details',
      type: 'actions',
      minWidth: 50,
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Visibility />} label="Consulter" onClick={() => router.push(`/administration/seances/${row.id}`)} />,
      ],
    },
    {
      field: 'dateStart',
      headerName: 'Date',
      minWidth: 110,
      valueFormatter: params => formatDateDDsMMsYYYY(params.value),
    },
    {
      field: 'type',
      headerName: 'Type de séance',
      minWidth: 150,
      valueFormatter: ({ value }: { value: CourseType }) => CourseTypeNames[value],
    },
    {
      field: 'price',
      headerName: 'Prix',
      valueFormatter: ({ value }: { value: number }) => value > 0 ? `${value} €` : 'Gratuit',
    },
    {
      field: 'notes',
      headerName: 'Notes',
    },
    ...(!readOnly ? [{
      field: 'actions',
      type: 'actions',
      getActions: ({ row }: GridRowParams) => [
        <GridActionsCellItem icon={<Edit />} label="Modifier" onClick={() => router.push(`/administration/seances/${row.id}/edition`)} />,
        <GridActionsCellItem icon={<Cancel />} onClick={() => null} label="Annuler" />,
      ],
    } as GridEnrichedColDef] : []),
  ];

  return (
    <AsyncGrid columns={columns} query={['course.findAll']} />
  );
};
