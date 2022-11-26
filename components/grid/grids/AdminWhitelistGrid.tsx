import React from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import { Cancel, Edit, Visibility } from '@mui/icons-material';
import { formatDateDDsMMsYYYY } from '../../../lib/common/date';
import { CourseType } from '@prisma/client';
import { CourseTypeNames } from '../../../lib/common/course';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { useRouter } from 'next/router';

export const AdminWhitelistGrid: React.FunctionComponent = () => {
  const columns: GridColumns = [
    {
      field: 'email',
      headerName: 'Adresse e-mail',
      flex: 1,
    },
  ];

  return (
    <AsyncGrid columns={columns} query={['adminWhitelist.findAll']} getRowId={({ email }) => email} />
  );
};
