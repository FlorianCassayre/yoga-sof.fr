import { format } from 'date-fns';
import { BsKanban } from 'react-icons/bs';
import { CourseCards } from '../../components';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable } from '../../components/table';
import { displayCourseType, displayTimePeriod, dateFormat } from '../../lib/common';
import { BREADCRUMB_OVERVIEW } from '../../lib/client';

function AdminHomeLayout() {
  return (
    <ContentLayout title="Aperçu" icon={BsKanban} breadcrumb={BREADCRUMB_OVERVIEW}>
      <h2 className="h5">Planning</h2>

      <CourseCards readonly />

      <h2 className="h5">Prochaines séances</h2>

      <DynamicPaginatedTable
        url="/api/courses"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            isCanceled: false,
            dateEnd: { $gt: new Date().toISOString() },
          }),
          orderBy: JSON.stringify({ dateStart: '$asc' }),
        })}
        columns={[
          detailsColumnFor(id => `/administration/seances/planning/${id}`),
          {
            title: 'Date',
            render: ({ dateStart: date }) => format(new Date(date), dateFormat),
          },
          {
            title: 'Horaire',
            render: ({ dateStart, dateEnd }) => displayTimePeriod(dateStart, dateEnd),
          },
          {
            title: 'Type de séance',
            render: ({ type }) => displayCourseType(type),
          },
          {
            title: 'Inscriptions / Places disponibles',
            render: ({ slots, registrations }) => (
              <>
                {registrations.filter(({ isUserCanceled }) => !isUserCanceled).length}
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
