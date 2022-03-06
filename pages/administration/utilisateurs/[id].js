import Link from 'next/link';
import { useRouter } from 'next/router';
import { Badge, Button } from 'react-bootstrap';
import { BsPerson, BsPlusLg } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { cancelRegistrationColumn, DynamicPaginatedTable, plannedCourseLinkColumn, StaticPaginatedTable } from '../../../components/table';
import { usePromiseEffect } from '../../../hooks';
import { breadcrumbForUser, providersData } from '../../../lib/client';
import { getUser } from '../../../lib/client/api';
import { displayDatetime, formatTimestamp } from '../../../lib/common';

function AdminUserLayout({ id }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getUser(id, { include: ['courseRegistrations', 'accounts'] }), []);

  return (
    <ContentLayout title={`Utilisateur ${data && data.name}`} icon={BsPerson} breadcrumb={data && breadcrumbForUser(data)} isLoading={isLoading} isError={isError} error={error}>
      <h2 className="h5">Inscriptions</h2>
      <p>Les inscriptions (et désinscriptions) de cet utilisateur.</p>

      <DynamicPaginatedTable
        url="/api/courseRegistrations"
        params={(page, limit) => ({
          page,
          limit,
          where: JSON.stringify({ userId: parseInt(id) }),
          orderBy: JSON.stringify({ createdAt: '$desc' }),
          include: ['course', 'user'],
        })}
        columns={[
          plannedCourseLinkColumn,
          {
            title: `Date d'inscription`,
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
          {
            title: 'Statut',
            render: ({ isUserCanceled, canceledAt }) => (!isUserCanceled ? <Badge bg="success">Inscrit</Badge> : (
              <Badge bg="danger">
                Annulé à
                {formatTimestamp(canceledAt)}
              </Badge>
            )),
            props: { className: 'text-center' },
          },
          cancelRegistrationColumn,
        ]}
        renderEmpty={() => 'Cet utilisateur ne s\'est pas encore inscrit à une séance.'}
      />

      <div className="text-center mb-3">
        <Link href={{ pathname: '/administration/inscriptions/creation', query: { userId: data && data.id } }} passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire cet utilisateur à une séance
          </Button>
        </Link>
      </div>

      <h2 className="h5">Informations de connexion</h2>

      <StaticPaginatedTable
        rows={data && data.accounts}
        columns={[
          {
            title: 'Service',
            render: ({ provider }) => {
              const { icon: Icon, name: providerName } = providersData[provider];
              return <Icon className="icon" title={providerName} />;
            },
            props: { className: 'text-center' },
          },
          {
            title: 'Identifiant du service',
            render: ({ providerAccountId }) => providerAccountId,
            props: { className: 'font-monospace' },
          },
          {
            title: 'Dernière connexion',
            render: ({ updatedAt }) => displayDatetime(updatedAt),
          },
          {
            title: 'Première connexion',
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
        ]}
        renderEmpty={() => `Aucun service de connexion enregistré. Cet utilisateur n'a donc pas la possibilité de se connecter à ce compte pour le moment.`}
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
