import { format } from 'date-fns';
import Link from 'next/link';
import { Badge, Button } from 'react-bootstrap';
import { BsCalendarDate, BsPlusLg } from 'react-icons/bs';
import {
  BREADCRUMB_REGISTRATIONS, dateFormat, formatTimestamp,
  DynamicPaginatedTable, SESSIONS_TYPES, userLinkColumn, plannedSessionLinkColumn, idColumn, renderDatetime,
} from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';

function AdminRegistrationsLayout({ pathname }) {

  return (
    <ContentLayout pathname={pathname} title="Inscriptions" breadcrumb={BREADCRUMB_REGISTRATIONS}>

      <p>
        Liste des inscriptions passées et futures à des séances programmées.
      </p>

      <DynamicPaginatedTable
        url="/api/registrations"
        params={(page, limit) => ({
          page,
          limit,
          orderBy: JSON.stringify({
            created_at: '$desc',
          }),
          include: ['session', 'user'],
        })}
        columns={[
          userLinkColumn,
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
      />

      <div className="text-center">
        <Link href="/administration/inscriptions/creation" passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire un utilisateur à une séance
          </Button>
        </Link>
      </div>

    </ContentLayout>
  );
}

export default function AdminRegistrations({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} title="Inscriptions" breadcrumb={BREADCRUMB_REGISTRATIONS}>

      <AdminRegistrationsLayout pathname={pathname} />

    </PrivateLayout>
  );
}

AdminRegistrations.getInitialProps = ({ pathname })  => {
  return { pathname };
}
