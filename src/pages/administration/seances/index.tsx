import React, { useCallback } from 'react';
import { GuardedBackofficeContainer } from '../../../components/layout/admin/GuardedBackofficeContainer';
import { BackofficeContent } from '../../../components/layout/admin/BackofficeContent';
import { DateRange, Event } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { CourseModelCards } from '../../../components/CourseModelCards';
import { BasicSpeedDial } from '../../../components/BasicSpeedDial';
import { AsyncGrid } from '../../../components/grid';
import { trpc } from '../../../common/trpc';
import { GridColDef } from '@mui/x-data-grid';
import { CourseGrid } from '../../../components/grid/grids/CourseGrid';
import { useBackofficeWritePermission } from '../../../components/hooks/usePermission';

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
  const hasWritePermission = useBackofficeWritePermission();

  return (
    <BackofficeContent
      title="Séances"
      icon={<DateRange />}
      quickActions={hasWritePermission ? [
        { icon: <DateRange />, name: 'Planification de séances', url: '/administration/seances/planning/creation' },
        { icon: <Event />, name: 'Nouveau modèle de séance', url: '/administration/seances/modeles/creation' },
      ] : []}
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
        Les utilisateurs ne peuvent s'inscrire qu'à des séances qui ont été planifiées.
        Ce tableau contient la liste des séances passées, présentes et futures. Le bouton permet de planifier de
        nouvelles séances. Il n'est pas possible de supprimer de séances, en revanche il est possible d'en annuler.
      </Typography>
      <CourseGrid future canceled={false} />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Séances passées
      </Typography>
      <Typography paragraph>
        Les séances passées.
      </Typography>
      <CourseGrid future={false} canceled={false} />

      <Typography variant="h6" component="div" sx={{ mt: 2 }}>
        Séances annulées
      </Typography>
      <Typography paragraph>
        Les séances ayant été annulées.
      </Typography>
      <CourseGrid future={null} canceled />
    </BackofficeContent>
  );
};

export default function AdminHome() {
  return (
    <AdminHomeContent />
  );
}
