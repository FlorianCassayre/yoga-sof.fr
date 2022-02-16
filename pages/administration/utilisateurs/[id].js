import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge, Button } from 'react-bootstrap';
import { BsPerson, BsPlusLg } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import {
  cancelRegistrationColumn,
  DynamicPaginatedTable,
  plannedSessionLinkColumn,
  renderDatetime, renderEmail, StaticPaginatedTable,
} from '../../../components/table';
import { usePromiseEffect } from '../../../hooks';
import { breadcrumbForUser, providersData } from '../../../lib/client';
import { getUser } from '../../../lib/client/api';
import { formatTimestamp } from '../../../lib/common';

function AdminUserLayout({ id }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getUser(id, { include: ['registrations', 'user_linked_accounts'] }), []);

  return (
    <ContentLayout
      title={`Utilisateur ${data && data.name}`}
      icon={BsPerson}
      breadcrumb={data && breadcrumbForUser(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >

      <h2 className="h5">Inscriptions</h2>
      <p>
        Les inscriptions (et désinscriptions) de cet utilisateur.
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
          },
          cancelRegistrationColumn,
        ]}
        renderEmpty={() => `Cet utilisateur ne s'est pas encore inscrit à une séance.`}
      />

      <div className="text-center mb-3">
        <Link href={{ pathname: '/administration/inscriptions/creation', query: { user_id: data && data.id } }} passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire cet utilisateur à une séance
          </Button>
        </Link>
      </div>

      <h2 className="h5">Informations de connexion</h2>

      <StaticPaginatedTable
        rows={data && data.user_linked_accounts}
        columns={[
          {
            title: 'Service',
            render: ({ provider }) => {
              const { icon: Icon, name: providerName } = providersData[provider];
              return (
                <Icon className="icon" title={providerName} />
              );
            },
            props: {
              className: 'text-center',
            },
          },
          {
            title: 'Identifiant du service',
            render: ({ id_provider }) => id_provider,
            props: {
              className: 'font-monospace',
            },
          },
          {
            title: 'Adresse email',
            render: ({ email }) => renderEmail(email),
            props: {
              className: 'font-monospace',
            },
          },
          {
            title: `Dernière connexion`,
            render: ({ updated_at: updatedAt }) => renderDatetime(updatedAt),
          },
          {
            title: `Première connexion`,
            render: ({ created_at: createdAt }) => renderDatetime(createdAt),
          },
        ]}
        renderEmpty={() => 'Aucun service de connexion enregistré. Cet utilisateur n\'a donc pas la possibilité de se connecter à ce compte pour le moment.'}
      />

    </ContentLayout>
  );
}

export default function AdminUser() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>

      <AdminUserLayout id={id} />

    </PrivateLayout>
  );
}
