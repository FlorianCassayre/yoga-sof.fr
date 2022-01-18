import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from 'react-bootstrap';
import { BsCalendarDate, BsPerson } from 'react-icons/bs';
import {
  BREADCRUMB_REGISTRATIONS, dateFormat, formatTimestamp,
  DynamicPaginatedTable, SESSIONS_TYPES,
} from '../../components';
import { PrivateLayout } from '../../components/layout/admin';

export default function AdminRegistrations({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} title="Inscriptions" breadcrumb={BREADCRUMB_REGISTRATIONS}>

      <p>
        Liste des inscriptions passées et futures à des séances programmées.
      </p>

      <DynamicPaginatedTable
        url="/api/registrations"
        params={(page, limit) => ({
          page,
          limit,
          include: ['session', 'user'],
        })}
        columns={[
          {
            title: '#',
            render: ({ id }) => id,
          },
          {
            title: 'Utilisateur',
            render: ({ user_id, user: { name } }) => (
              <Link href={`/administration/utilisateurs/${user_id}`} passHref>
                <a>
                  <BsPerson className="icon me-2" />
                  {name}
                </a>
              </Link>
            ),
          },
          {
            title: 'Séance',
            render: ({ session_id, session: { type, date_start } }) => (
              <Link href={`/administration/seances/${session_id}`} passHref>
                <a>
                  <BsCalendarDate className="icon me-2" />
                  {SESSIONS_TYPES.filter(({ id }) => id === type)[0].title}
                  {' le '}
                  {format(new Date(date_start), dateFormat)}
                </a>
              </Link>
            )
          },
          {
            title: 'Date d\'inscription',
            render: ({ created_at }) => (
              formatTimestamp(created_at)
            ),
          },
          {
            title: 'Statut',
            render: ({ is_user_canceled, canceled_at }) => !is_user_canceled ? (
              <Badge bg="success">Inscrit</Badge>
            ) : (
              <Badge bg="danger">Annulé à {formatTimestamp(canceled_at)}</Badge>
            ),
            props: {
              className: 'text-center'
            }
          }
        ]}
      />

    </PrivateLayout>
  )
}

AdminRegistrations.getInitialProps = ({ pathname })  => {
  return { pathname };
}
