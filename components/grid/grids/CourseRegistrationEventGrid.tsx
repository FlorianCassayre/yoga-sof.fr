import React from 'react';
import { GridColumns, GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { Cancel, ContentPaste, ContentPasteOff, Login, Logout } from '@mui/icons-material';
import { CourseRegistration } from '@prisma/client';
import { GridActionsCellItem, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { Tooltip } from '@mui/material';

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
      type: 'actions',
      getActions: ({ row }: GridRowParams<{ registration: CourseRegistration }>) => !row.registration.isUserCanceled ? [ // TODO
        <GridActionsCellItem icon={<Cancel />} onClick={() => null} label="Annuler" />,
      ] : [],
    } as GridEnrichedColDef]),
  ];

  return (
    <AsyncGrid columns={columns} query={['courseRegistration.findAllEvents', { courseId, userId }]} getRowId={({ isEventTypeUserCanceled, registration: { id } }) => `${isEventTypeUserCanceled}:${id}`} />
  );
};
