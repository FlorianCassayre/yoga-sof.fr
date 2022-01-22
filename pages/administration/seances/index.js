import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { Badge, Button } from 'react-bootstrap';
import { BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import {
  BREADCRUMB_SESSIONS, CancelSessionConfirmDialog, ConfirmDialog, dateFormat, detailsColumnFor,
  DynamicPaginatedTable,
  SESSIONS_TYPES,
  SessionsCards, SessionStatusBadge,
} from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import Link from 'next/link';

function AdminSeancesLayout({ pathname }) {
  const router = useRouter();

  const renderDate = ({ date_start: date }) => format(new Date(date), dateFormat);

  const renderTimePeriod = ({ date_start, date_end }) => (
    <>
      {format(new Date(date_start), 'HH\'h\'mm')}
      {' '}à{' '}
      {format(new Date(date_end), 'HH\'h\'mm')}
    </>
  );

  const renderSessionType = ({ type }) => SESSIONS_TYPES.find(({ id }) => id === type).title;

  const sessionColumns = hasPassed => [
    detailsColumnFor(id => `/administration/seances/planning/${id}`),
    {
      title: 'Statut',
      render: session => (
        <SessionStatusBadge session={session} />
      ),
      props: {
        className: 'text-center',
      },
    },
    {
      title: 'Date',
      render: renderDate,
    },
    {
      title: 'Horaire',
      render: renderTimePeriod,
    },
    {
      title: 'Type de séance',
      render: renderSessionType,
    },
    {
      title: 'Prix',
      render: ({ price }) => price > 0 ? `${price} €` : 'Gratuit',
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
    {
      title: 'Modifier',
      render: obj => (
        <Link href={`/administration/seances/planning/${obj.id}/edition`} passHref>
          <Button size="sm">
            <BsPencil className="icon" />
          </Button>
        </Link>
      ),
      props: {
        className: 'text-center',
      },
    },
    ...(!hasPassed ? [{
      title: 'Annuler',
      render: obj => (
        <CancelSessionConfirmDialog
          session={obj}
          triggerer={clickHandler => (
            <Button size="sm" variant="danger" onClick={clickHandler}>
              <BsXOctagon className="icon" />
            </Button>
          )}
        />
      ),
      props: {
        className: 'text-center',
      },
    }] : []),
  ];

  return (
    <ContentLayout pathname={pathname} title="Séances" breadcrumb={BREADCRUMB_SESSIONS}>


      <h2 className="h5">Modèles de séances</h2>

      <p>
        Il s'agit des horaires hebdomadaires de déroulement des séances qui seront affichées sur le site.
        Ces modèles servent ensuite à efficacement planifier un lot de séances (ci-dessous).
        Il reste possible de planifier des séances à d'autres dates et horaires que celles indiquées par les modèles.
      </p>

      <SessionsCards />

      <h2 className="h5">Planification et séances à venir</h2>

      <p>
        Les utilisateurs ne peuvent seulement s'inscrire à des séances qui ont été planifiées.
        Ce tableau contient la liste des séances passées, présentes et futures.
        Le bouton permet de planifier de nouvelles séances.
        Il n'est pas possible de supprimer de séances, en revanche il est possible d'en annuler.
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
            date_end: {
              $gt: new Date().toISOString(),
            },
          }),
          orderBy: JSON.stringify({
            date_start: '$asc',
          }),
        })}
        columns={sessionColumns(false)}
      />

      <h2 className="h5">Séances passées et annulées</h2>

      <p>
        Les séances passées ou ayant été annulées.
      </p>

      <DynamicPaginatedTable
        url="/api/sessions"
        params={(page, limit) => ({
          page,
          limit,
          include: ['registrations'],
          where: JSON.stringify({
            $not: {
              is_canceled: false,
              date_end: {
                $gt: new Date().toISOString(),
              },
            },
          }),
          orderBy: JSON.stringify({
            date_start: '$desc',
          }),
        })}
        columns={sessionColumns(true)}
      />

    </ContentLayout>
  );
}

export default function AdminSeances({ pathname }) {

  return (
    <PrivateLayout pathname={pathname}>

      <AdminSeancesLayout pathname={pathname} />

    </PrivateLayout>
  );
}

AdminSeances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
