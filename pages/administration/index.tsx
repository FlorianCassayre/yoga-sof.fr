import React, { useCallback, useMemo } from 'react';
import { GuardedBackofficeContainer } from '../../components/layout/admin/GuardedBackofficeContainer';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Cancel, Dashboard, Edit, Visibility } from '@mui/icons-material';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import { CourseModelCards } from '../../components/CourseModelCards';
import { BasicSpeedDial } from '../../components/BasicSpeedDial';
import { AsyncGrid } from '../../components/grid';
import { trpc } from '../../lib/common/trpc';
import { UseQueryResult } from 'react-query';
import { Paginated } from '../../lib/server/services/helpers/types';
import { TRPCClientErrorLike } from '@trpc/client';
import { AppRouter } from '../../lib/server/controllers';
import { Course, CourseType } from '@prisma/client';
import { GridActionsCellItem, GridColDef, GridRowParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { formatDateDDsMMsYYYY } from '../../lib/common/newDate';
import { CourseTypeNames } from '../../lib/common/newCourse';
import { GridColumns } from '@mui/x-data-grid/models/colDef/gridColDef';
import { CourseGrid } from '../../components/grid/grids/CourseGrid';

/*function AdminHomeLayout() {
  const { data: session } = useSession();

  return (
    <ContentLayout title="Aperçu" icon={BsKanban} breadcrumb={BREADCRUMB_OVERVIEW}>
      <h2 className="h5">Planning</h2>

      <CourseCards readonly />

      <h2 className="h5">Prochaines séances</h2>

      <DynamicPaginatedTable
        url="/api/courses"
        params={(page, limit, { sort }) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            isCanceled: false,
            dateEnd: { $gt: new Date().toISOString() },
          }),
          orderBy: sort ? { [sort.column]: sort.order ? '$asc' : '$desc' } : undefined,
        })}
        columns={[
          detailsColumnFor(id => `/administration/seances/planning/${id}`),
          {
            title: 'Date',
            name: 'dateStart',
            sortable: true,
            initialSortValue: true,
            render: ({ dateStart: date }) => formatDateLiteral(date),
          },
          {
            title: 'Horaire',
            render: ({ dateStart, dateEnd }) => displayTimePeriod(dateStart, dateEnd),
          },
          {
            title: 'Type de séance',
            name: 'type',
            sortable: true,
            render: ({ type }) => displayCourseType(type),
          },
          {
            title: 'Inscriptions / Places disponibles',
            name: 'registrations._count',
            sortable: true,
            render: ({ slots, registrations }) => {
              const registered = registrations.filter(({ isUserCanceled }) => !isUserCanceled).length;
              return (
                <>
                  <span className={registered > 0 ? 'text-success' : ''}>{registered}</span>
                  {' '}
                  /
                  {' '}
                  {slots}
                </>
              );
            },
            props: { className: 'text-center' },
          },
          {
            title: 'Notes',
            render: ({ notes }) => notes,
            props: { style: { whiteSpace: 'pre-wrap' } },
          },
        ]}
        renderEmpty={() => 'Aucune séance planifiée à venir.'}
      />

      <div className="text-end">
        <ButtonICSLink session={session} coach />
      </div>
    </ContentLayout>
  );
}*/



const AdminHomeContent: React.FC = () => {
  return (
    <BackofficeContent
      title="Aperçu"
      icon={<Dashboard />}
    >
      <Typography variant="h6" component="div" sx={{ mb: 2 }}>
        Planning ordinaire
      </Typography>
      <CourseModelCards readOnly />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Prochaines séances
      </Typography>
      <CourseGrid readOnly />
    </BackofficeContent>
  );
};

export default function AdminHome() {
  return (
    <AdminHomeContent />
  );
}
