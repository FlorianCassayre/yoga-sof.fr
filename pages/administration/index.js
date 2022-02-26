import { format } from 'date-fns';
import { BsKanban } from 'react-icons/bs';
import { SessionsCards } from '../../components';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable } from '../../components/table';
import { displaySessionType, displayTimePeriod, dateFormat } from '../../lib/common';
import { BREADCRUMB_OVERVIEW } from '../../lib/client';

function AdminHomeLayout() {
  return (
    <ContentLayout title="Aperçu" icon={BsKanban} breadcrumb={BREADCRUMB_OVERVIEW}>
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
            date_end: { $gt: new Date().toISOString() },
          }),
          orderBy: JSON.stringify({ date_start: '$asc' }),
        })}
        columns={[
          detailsColumnFor(id => `/administration/seances/planning/${id}`),
          {
            title: 'Date',
            render: ({ date_start: date }) => format(new Date(date), dateFormat),
          },
          {
            title: 'Horaire',
            render: ({ date_start: dateStart, date_end: dateEnd }) => displayTimePeriod(dateStart, dateEnd),
          },
          {
            title: 'Type de séance',
            render: ({ type }) => displaySessionType(type),
          },
          {
            title: 'Inscriptions / Places disponibles',
            render: ({ slots, registrations }) => (
              <>
                {registrations.filter(({ is_user_canceled: isUserCanceled }) => !isUserCanceled).length}
                {' '}
                /
                {' '}
                {slots}
              </>
            ),
          },
          {
            title: 'Notes',
            render: ({ notes }) => notes,
            props: { style: { whiteSpace: 'pre-wrap' } },
          },
        ]}
        renderEmpty={() => 'Aucune séance planifiée à venir.'}
      />
    </ContentLayout>
  );
}

export default function AdminHome() {
  return (
    <PrivateLayout>
      <AdminHomeLayout />
    </PrivateLayout>
  );
}
