import React from 'react';
import { ContentPaste, ContentPasteOff, EventAvailable } from '@mui/icons-material';
import { CourseRegistration } from '@prisma/client';
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { courseColumn, relativeTimestamp, userColumn } from './common';
import { Tooltip } from '@mui/material';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';

interface CourseRegistrationEventGridProps {
  courseId?: number;
  userId?: number;
  readOnly?: boolean;
}

export const CourseRegistrationEventGrid: React.FunctionComponent<CourseRegistrationEventGridProps> = ({ courseId, userId, readOnly }) => {
  type CourseRegistrationEvent = RouterOutput['courseRegistration']['findAllEvents'][0];
  const columns: GridColDef<CourseRegistrationEvent>[] = [
    {
      field: 'isEventTypeUserCanceled',
      headerName: 'Événement',
      renderCell: ({ value }: GridRenderCellParams<CourseRegistrationEvent, boolean>) => (
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
    ...(userId !== undefined ? [] : [userColumn({ field: 'registration.user', valueGetter: ({ row }: GridValueGetterParams<CourseRegistrationEvent>) => row.registration.user, flex: 1 })]),
    ...(courseId !== undefined ? [] : [courseColumn({ field: 'registration.course', valueGetter: ({ row }: GridValueGetterParams<CourseRegistrationEvent>) => row.registration.course, flex: 2 })]),
    relativeTimestamp({ field: 'date', headerName: `Date`, flex: 1 }),
    ...(readOnly ? [] : [{
      field: 'actions',
      headerName: '',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<{ registration: CourseRegistration }>) => !row.registration.isUserCanceled && (
        <Tooltip title="Inscription active">
          <EventAvailable color="success" />
        </Tooltip>
      ),
      align: 'center',
    } satisfies GridColDef<CourseRegistrationEvent>]),
  ];

  return (
    <AsyncGrid columns={columns} procedure={trpc.courseRegistration.findAllEvents} input={{ courseId, userId }} getRowId={({ isEventTypeUserCanceled, registration: { id } }) => `${isEventTypeUserCanceled}:${id}`} initialSort={{ field: 'date', sort: 'desc' }} />
  );
};
