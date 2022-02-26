import { format } from 'date-fns';
import { Button } from 'react-bootstrap';
import { BsCalendarWeek, BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import Link from 'next/link';
import { CancelSessionConfirmDialog, SessionsCards, SessionStatusBadge } from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable } from '../../../components/table';
import { displaySessionType, displayTimePeriod, dateFormat } from '../../../lib/common';
import { BREADCRUMB_SESSIONS } from '../../../lib/client';

function AdminSeancesLayout() {
  const renderDate = ({ date_start: date }) => format(new Date(date), dateFormat);

  const sessionColumns = hasPassed => [
    detailsColumnFor(id => `/administration/seances/planning/${id}`),
    {
      title: 'Statut',
      render: session => <SessionStatusBadge session={session} />,
      props: { className: 'text-center' },
    },
    {
      title: 'Date',
      render: renderDate,
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
      title: 'Prix',
      render: ({ price }) => (price > 0 ? `${price} €` : 'Gratuit'),
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
            <CancelSessionConfirmDialog
              session={obj}
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
    <ContentLayout title="Séances" icon={BsCalendarWeek} breadcrumb={BREADCRUMB_SESSIONS}>
      <h2 className="h5">Modèles de séances</h2>

      <p>
        Il s'agit des horaires hebdomadaires de déroulement des séances qui seront affichées sur le site. Ces modèles servent ensuite à efficacement planifier un lot de séances (ci-dessous). Il reste
        possible de planifier des séances à d'autres dates et horaires que celles indiquées par les modèles.
      </p>

      <SessionsCards />

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
        columns={sessionColumns(false)}
        renderEmpty={() => <>Il n'y a pas de séances à venir pour le moment.</>}
      />

      <h2 className="h5">Séances passées et annulées</h2>

      <p>Les séances passées ou ayant été annulées.</p>

      <DynamicPaginatedTable
        url="/api/sessions"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            $not: {
              is_canceled: false,
              date_end: { $gt: new Date().toISOString() },
            },
          }),
          orderBy: JSON.stringify({ date_start: '$desc' }),
        })}
        columns={sessionColumns(true)}
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
