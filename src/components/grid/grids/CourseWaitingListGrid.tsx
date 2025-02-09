import React from 'react';
import {
  Check,
  Timelapse,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { AsyncGrid } from '../AsyncGrid';
import { GridRenderCellParams } from '@mui/x-data-grid/models/params/gridCellParams';
import { Tooltip } from '@mui/material';
import { trpc } from '../../../common/trpc';
import { RouterOutput } from '../../../server/controllers/types';
import { courseColumn, relativeTimestamp, userColumn } from './common';

export const CourseWaitingListGrid: React.FunctionComponent = () => {
  type CourseWaitingListItem = RouterOutput['course']['findWaitingList'][0];
  const columns: GridColDef<CourseWaitingListItem>[] = [
    userColumn({
      field: 'user',
      flex: 1,
    }),
    courseColumn({
      field: 'course',
      flex: 2,
    }),
    relativeTimestamp({
      field: 'createdAt',
      headerName: `Date de création`,
      flex: 1,
    }),
    relativeTimestamp({
      field: 'notifiedAt',
      headerName: `Date de notification`,
      flex: 1,
    }),
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      renderCell: ({ row }: GridRenderCellParams<CourseWaitingListItem>) => row.isNotified ? (
        <Tooltip title="Une place s'est libérée et l'utilisateur a été notifié">
          <Check color="success" />
        </Tooltip>
      ) : (
        <Tooltip title="En attente qu'une place se libère">
          <Timelapse color="action" />
        </Tooltip>
      ),
      align: 'center',
    },
  ];
  return (
    <AsyncGrid columns={columns} procedure={trpc.course.findWaitingList} input={undefined} initialSort={{ field: 'createdAt', sort: 'desc' }} />
  );
};
