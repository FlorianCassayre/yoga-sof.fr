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
  DynamicPaginatedTable,
  SESSIONS_TYPES, idColumn, plannedSessionLinkColumn, renderDatetime,
} from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { useDataApi } from '../../../hooks';

function AdminUserLayout({ pathname, id }) {
  const [{ isLoading, isError, data, error }] = useDataApi(`/api/users/${id}`, {
    include: 'registrations',
  });

  return (
    <ContentLayout
      pathname={pathname}
      title={`Utilisateur ${data && data.name}`}
      breadcrumb={data && breadcrumbForUser(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >

      <p>
        Les inscriptions de cet utilisateur.
      </p>

      <DynamicPaginatedTable
        url="/api/registrations"
        params={(page, limit) => ({
          page,
          limit,
          where: JSON.stringify({
            user_id: parseInt(id),
          }),
          orderBy: JSON.stringify({
            created_at: '$desc',
          }),
          include: ['session', 'user'],
        })}
        columns={[
          plannedSessionLinkColumn,
          {
            title: 'Date d\'inscription',
            render: ({ created_at }) => renderDatetime(created_at),
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
        renderEmpty={() => `Cet utilisateur ne s'est pas encore inscrit à une séance.`}
      />

    </ContentLayout>
  );
}

export default function AdminUser({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>

      <AdminUserLayout pathname={pathname} id={id} />

    </PrivateLayout>
  );
}

AdminUser.getInitialProps = ({ pathname })  => {
  return { pathname };
}
