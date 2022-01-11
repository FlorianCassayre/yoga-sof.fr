import { format } from 'date-fns';
import { useMemo } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar, BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import {
  BREADCRUMB_SESSIONS, dateFormat,
  PaginatedTable,
  SESSIONS_TYPES,
  SessionsCards,
  StarIndicator,
  WEEKDAYS,
} from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import { useDataApi } from '../../../hooks';
import Link from 'next/link';

export default function AdminSeances({ pathname }) {

  const [{ isLoading, isError, data, error }] = useDataApi('/api/session_models');

  const dataKV = useMemo(() => data && Object.fromEntries(data.map(obj => [obj.type, obj])), [data]);

  return (
    <PrivateLayout pathname={pathname} title="Séances" breadcrumb={BREADCRUMB_SESSIONS}>

      <p>
        Ci-dessous, les modèles de séances.
        Il s'agit des horaires normales de déroulement des séances et seront affichées sur le site.
        Il reste possible de planifier des séances à d'autres dates et horaires.
      </p>

      <SessionsCards />

      <Link href="/administration/seances/planning/creation" passHref>
        <Button variant="success" className="mb-2">
          <BsPlusLg className="icon me-2" />
          Planifier de nouvelles séances
        </Button>
      </Link>

      <PaginatedTable
        url="/api/sessions"
        params={(page, limit) => ({
          page,
          limit,
        })}
        columns={[
          {
            title: '#',
            render: ({ id }) => id,
          },
          {
            title: 'Date',
            render: ({ date_start: date }) => format(new Date(date), dateFormat),
          },
          {
            title: 'Horaire',
            render: ({ date_start, date_end }) => (
              <>
                {format(new Date(date_start), 'HH\'h\'mm')}
                {' '}à{' '}
                {format(new Date(date_end), 'HH\'h\'mm')}
              </>
            ),
          },
          {
            title: 'Type de séance',
            render: ({ type }) => SESSIONS_TYPES.find(({ id }) => id === type).title,
          },
          {
            title: 'Inscriptions / Places disponibles',
            render: ({ spots }) => (
              <>
                0 / {spots}
              </>
            ),
          },
          {
            title: 'Statut',
            render: ({ is_canceled, date_start, date_end }) => {
              const now = new Date();
              const dateStart = new Date(date_start), dateEnd = new Date(date_end);
              return (
                is_canceled ? (
                  <Badge bg="danger">Annulée</Badge>
                ) : (now.getTime() < dateStart.getTime() ? (
                  <Badge bg="info">À venir</Badge>
                ) : now.getTime() <= dateEnd.getTime() ? (
                  <Badge bg="success">En cours</Badge>
                ) : (
                  <Badge bg="secondary">Passée</Badge>
                ))
              )
            },
            props: {
              className: 'text-center',
            },
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
            title: 'Actions',
            render: ({ id, is_canceled }) => (
              <>
                <Link href={`/administration/seances/planning/${id}/edition`} passHref>
                  <Button size="sm" className="m-1">
                    <BsPencil className="icon" />
                  </Button>
                </Link>
                <Button size="sm" variant="danger" className="m-1" disabled={is_canceled}>
                  <BsXOctagon className="icon" />
                </Button>
              </>
            ),
            props: {
              className: 'text-center',
            },
          }
        ]}
      />

    </PrivateLayout>
  );
}

AdminSeances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
