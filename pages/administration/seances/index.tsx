import React, { useCallback } from 'react';
import { GuardedBackofficeContainer } from '../../../components/layout/admin/GuardedBackofficeContainer';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { DateRange, Event } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { CourseModelCards } from '../../../components/CourseModelCards';
import { BasicSpeedDial } from '../../../components/BasicSpeedDial';
import { AsyncGrid, QueryParameters } from '../../../components/grid';
import { trpc } from '../../../lib/common/trpc';
import { GridColDef } from '@mui/x-data-grid';

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

const LatestCoursesGrid: React.FC = () => {
  const useCoursesQuery = useCallback(({ pagination }: QueryParameters) => trpc.useQuery(['course.getAllPaginated', { pagination }]), []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#' },
  ];

  return (
    <AsyncGrid columns={columns} useQuery={useCoursesQuery} />
  );
};

const AdminHomeContent: React.FC = () => {
  return (
    <BackofficeContent
      title="Séances"
      icon={<DateRange />}
      actions={[
        { icon: <Event />, name: 'Nouveau modèle de séance', url: '/administration/seances/modeles/creation' }
      ]}
    >
      <Typography variant="h6" component="div">
        Modèles de séances
      </Typography>
      <Typography paragraph>
        Il s'agit des horaires hebdomadaires de déroulement des séances. Ces modèles servent ensuite à efficacement planifier un lot de séances (ci-dessous). Il reste
        possible de planifier des séances à d'autres dates et horaires que celles indiquées par les modèles.
      </Typography>
      <CourseModelCards />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Séances à venir
      </Typography>
      <Typography paragraph>
        Les utilisateurs ne peuvent seulement s'inscrire à des séances qui ont été planifiées.
        Ce tableau contient la liste des séances passées, présentes et futures. Le bouton permet de planifier de
        nouvelles séances. Il n'est pas possible de supprimer de séances, en revanche il est possible d'en annuler.
      </Typography>
      <LatestCoursesGrid />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Séances passées ou annulées
      </Typography>
      <Typography paragraph>
        Les séances passées ou ayant été annulées.
      </Typography>
    </BackofficeContent>
  );
};

export default function AdminHome() {
  return (
    <AdminHomeContent />
  );
}
