import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge, Button } from 'react-bootstrap';
import { BsCalendarDate, BsPlusLg } from 'react-icons/bs';
import {
  breadcrumbForUser,
  formatTimestamp,
  DynamicPaginatedTable,
  plannedSessionLinkColumn, renderDatetime,
} from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { usePromiseEffect } from '../../../hooks';
import { getUser } from '../../../lib/client/api';

function AdminUserLayout({ pathname, id }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getUser(id, { include: 'registrations' }), []);

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

      <div className="text-center">
        <Link href={{ pathname: '/administration/inscriptions/creation', query: { user_id: data && data.id } }} passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire cet utilisateur à une séance
          </Button>
        </Link>
      </div>

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
