import { format } from 'date-fns';
import { Button } from 'react-bootstrap';
import { BsCalendarWeek, BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import Link from 'next/link';
import { CancelCourseConfirmDialog, CourseCards, CourseStatusBadge } from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable } from '../../../components/table';
import { displayCourseType, displayTimePeriod, dateFormat } from '../../../lib/common';
import { BREADCRUMB_COURSES } from '../../../lib/client';

function AdminSeancesLayout() {
  const renderDate = ({ dateStart: date }) => format(new Date(date), dateFormat);

  const courseColumns = hasPassed => [
    detailsColumnFor(id => `/administration/seances/planning/${id}`),
    {
      title: 'Statut',
      render: course => <CourseStatusBadge course={course} />,
      props: { className: 'text-center' },
    },
    {
      title: 'Date',
      render: renderDate,
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
      title: 'Prix',
      render: ({ price }) => (price > 0 ? `${price} €` : 'Gratuit'),
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
    {
      title: 'Modifier',
      render: obj => (
        <Link href={`/administration/seances/planning/${obj.id}/edition`} passHref>
          <Button size="sm">
            <BsPencil className="icon" />
          </Button>
        </Link>
      ),
      props: { className: 'text-center' },
    },
    ...(!hasPassed
      ? [
        {
          title: 'Annuler',
          render: obj => (
            <CancelCourseConfirmDialog
              course={obj}
              triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
                <Button size="sm" variant="danger" onClick={clickHandler}>
                  <BsXOctagon className="icon" />
                </Button>
              )}
            />
          ),
          props: { className: 'text-center' },
        },
      ]
      : []),
  ];

  return (
    <ContentLayout title="Séances" icon={BsCalendarWeek} breadcrumb={BREADCRUMB_COURSES}>
      <h2 className="h5">Modèles de séances</h2>

      <p>
        Il s'agit des horaires hebdomadaires de déroulement des séances qui seront affichées sur le site. Ces modèles servent ensuite à efficacement planifier un lot de séances (ci-dessous). Il reste
        possible de planifier des séances à d'autres dates et horaires que celles indiquées par les modèles.
      </p>

      <CourseCards />

      <h2 className="h5">Planification et séances à venir</h2>

      <p>
        Les utilisateurs ne peuvent seulement s'inscrire à des séances qui ont été planifiées. Ce tableau contient la liste des séances passées, présentes et futures. Le bouton permet de planifier de
        nouvelles séances. Il n'est pas possible de supprimer de séances, en revanche il est possible d'en annuler.
      </p>

      <div className="text-center mb-4">
        <Link href="/administration/seances/planning/creation" passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Planifier de nouvelles séances
          </Button>
        </Link>
      </div>

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
        columns={courseColumns(false)}
        renderEmpty={() => <>Il n'y a pas de séances à venir pour le moment.</>}
      />

      <h2 className="h5">Séances passées et annulées</h2>

      <p>Les séances passées ou ayant été annulées.</p>

      <DynamicPaginatedTable
        url="/api/courses"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            $not: {
              isCanceled: false,
              dateEnd: { $gt: new Date().toISOString() },
            },
          }),
          orderBy: JSON.stringify({ dateStart: '$desc' }),
        })}
        columns={courseColumns(true)}
        renderEmpty={() => <>Il n'y a pas encore de séances passées ou annulées.</>}
      />
    </ContentLayout>
  );
}

export default function AdminSeances() {
  return (
    <PrivateLayout>
      <AdminSeancesLayout />
    </PrivateLayout>
  );
}
