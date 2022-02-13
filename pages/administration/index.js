import { format } from 'date-fns';
import { SessionsCards } from '../../components';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable, renderSessionType, renderTimePeriod } from '../../components/table';
import { BREADCRUMB_OVERVIEW } from '../../lib/client';
import { dateFormat } from '../../lib/common';

function AdminHomeLayout({ pathname }) {
  return (
    <ContentLayout pathname={pathname} title="Aperçu" breadcrumb={BREADCRUMB_OVERVIEW}>

      <h2 className="h5">Planning</h2>

      <SessionsCards readonly />

      <h2 className="h5">Prochaines séances</h2>

      <DynamicPaginatedTable
        url="/api/sessions"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            is_canceled: false,
            date_end: {
              $gt: new Date().toISOString(),
            },
          }),
          orderBy: JSON.stringify({
            date_start: '$asc',
          }),
        })}
        columns={[
          detailsColumnFor(id => `/administration/seances/planning/${id}`),
          {
            title: 'Date',
            render: ({ date_start: date }) => format(new Date(date), dateFormat),
          },
          {
            title: 'Horaire',
            render: ({ date_start, date_end }) => renderTimePeriod(date_start, date_end),
          },
          {
            title: 'Type de séance',
            render: ({ type }) => renderSessionType(type),
          },
          {
            title: 'Inscriptions / Places disponibles',
            render: ({ slots, registrations }) => (
              <>
                {registrations.filter(({ is_user_canceled }) => !is_user_canceled).length} / {slots}
              </>
            ),
          },
          {
            title: 'Notes',
            render: ({ notes }) => notes,
            props: {
              style: {
                whiteSpace: 'pre-wrap',
              },
            },
          },
        ]}
      />

    </ContentLayout>
  );
}

export default function AdminHome({ pathname }) {
  return (
    <PrivateLayout pathname={pathname}>

      <AdminHomeLayout pathname={pathname} />

    </PrivateLayout>
  )
}

AdminHome.getInitialProps = ({ pathname })  => {
  return { pathname };
}
