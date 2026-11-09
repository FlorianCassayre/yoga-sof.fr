'use client';

import { Icon } from '@mui/material';
import { Check, Hourglass } from 'lucide-react';

import { DataGrid } from '../../components/grid/DataGrid';
import { DateTimeCell } from '../../components/grid/DateTimeCell';
import type { GridColumns } from '../../components/grid/GridColumns';
import { api } from '../../server/api';
import type { RouterOutputs } from '../../server/appRouter';
import { CourseLink } from '../course/CourseLink';
import { PersonLink } from '../user/PersonLink';

type WaitingListRow = RouterOutputs['waitingList']['list']['rows'][number];

interface CourseUserWaitingListGridProps {
  userId?: string;
}

export const CourseUserWaitingListGrid = ({ userId }: CourseUserWaitingListGridProps) => {
  const columns: GridColumns<WaitingListRow> = [
    ...(userId === undefined
      ? ([
          {
            field: 'userName',
            headerName: 'Utilisateur',
            flex: 1,
            renderCell: (params) => <PersonLink person={params.row} />,
          },
        ] satisfies GridColumns<WaitingListRow>)
      : []),
    {
      field: 'courseStartsAt',
      headerName: 'Séance',
      flex: 2,
      type: 'dateTime',
      renderCell: (params) => (
        <CourseLink
          course={{
            id: params.row.courseId,
            type: params.row.courseType,
            startsAt: params.row.courseStartsAt,
            endsAt: params.row.courseEndsAt,
          }}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Créée le',
      type: 'dateTime',
      flex: 1,
      renderCell: (params) => <DateTimeCell value={params.row.createdAt} />,
    },
    {
      field: 'notifiedAt',
      headerName: 'Notifiée le',
      type: 'dateTime',
      flex: 1,
      renderCell: (params) => <DateTimeCell value={params.row.notifiedAt} />,
    },
    {
      field: 'notified',
      headerName: '',
      width: 60,
      align: 'center',
      display: 'flex',
      renderCell: (params) =>
        params.row.notified ? (
          <Icon color="success">
            <Check size={18} />
          </Icon>
        ) : (
          <Icon color="disabled">
            <Hourglass size={18} />
          </Icon>
        ),
    },
  ];

  return (
    <DataGrid
      columns={columns}
      defaultSort={{ field: 'createdAt', sort: 'desc' }}
      procedure={api.waitingList.list}
      listInput={{ userId }}
    />
  );
};
