import React from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, CheckCircle, ContentPaste, ContentPasteOff, Login, Logout } from '@mui/icons-material';
import { CourseRegistration } from '@prisma/client';
import { GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { Tooltip } from '@mui/material';
import { trpc } from '../../../common/trpc';

interface CourseRegistrationEventGridProps {
  courseId?: number;
  userId?: number;
  readOnly?: boolean;
}

export const CourseRegistrationEventGrid: React.FunctionComponent<CourseRegistrationEventGridProps> = ({ courseId, userId, readOnly }) => {
  const columns: GridColumns = [
    {
      field: 'isEventTypeUserCanceled',
      headerName: 'Événement',
      renderCell: ({ value }: GridRenderCellParams<{ value: boolean }>) => (
        <Tooltip title={value ? 'Désinscription' : 'Inscription'}>
          {value ? (
            <ContentPasteOff color="error" />
          ) : (
            <ContentPaste color="success" />
          )}
        </Tooltip>
      ),
      align: 'center',
    },
    ...(userId !== undefined ? [] : [userColumn({ field: 'registration.user', valueGetter: params => params.row.registration.user, flex: 1 })]),
    ...(courseId !== undefined ? [] : [courseColumn({ field: 'registration.course', valueGetter: params => params.row.registration.course, flex: 2 })]),
    relativeTimestamp({ field: 'date', headerName: `Date`, flex: 1 }),
    ...(readOnly ? [] : [{
      field: 'actions',
      headerName: '',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<{ registration: CourseRegistration }>) => !row.registration.isUserCanceled && (
        <CheckCircle color="success" fontSize="small" />
      ),
      align: 'center',
    } as GridEnrichedColDef]),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.courseRegistrationFindAllEvents} input={{ courseId, userId }} getRowId={({ isEventTypeUserCanceled, registration: { id } }) => `${isEventTypeUserCanceled}:${id}`} initialSort={{ field: 'date', sort: 'desc' }} />
  );
};
