import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge, Spinner } from 'react-bootstrap';
import { BsCalendarDate } from 'react-icons/bs';
import {
  breadcrumbForUser,
  dateFormat,
  ErrorMessage,
  formatTimestamp,
  PaginatedTable,
  SESSIONS_TYPES,
} from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import { useDataApi } from '../../../hooks';


export default function AdminUser({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  const [{ isLoading, isError, data, error }] = useDataApi(`/api/users/${id}`, {
    include: 'registrations',
  });

  return (
    <PrivateLayout pathname={pathname} title={(
      <>
        Utilisateur
        {!isError && (!isLoading ? (
          ` ${data.name}`
        ) : (
          <Spinner animation="border" />
        ))}
      </>
    )} breadcrumb={breadcrumbForUser(id)}>

      <p>
        Les inscriptions de cet utilisateur.
      </p>

      {!isError ? (!isLoading ? (
        <PaginatedTable
          url="/api/registrations"
          params={(page, limit) => ({
            page,
            limit,
            where: JSON.stringify({
              user_id: parseInt(id),
            }),
            include: ['session', 'user'],
          })}
          columns={[
            {
              title: '#',
              render: ({ id }) => id,
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
      ) : (
        <div className="m-5 text-center">
          <Spinner animation="border" />
        </div>
      )) : (
        <ErrorMessage error={error} />
      )}

    </PrivateLayout>
  );
}

AdminUser.getInitialProps = ({ pathname })  => {
  return { pathname };
}
