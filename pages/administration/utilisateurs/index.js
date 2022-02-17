import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { BsPeople, BsPlusLg } from 'react-icons/bs';
import { StarIndicator } from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable, renderDatetime } from '../../../components/table';
import { BREADCRUMB_USERS, providersData } from '../../../lib/client';

function AdminUsersLayout() {
  const [total, setTotal] = useState(null);

  const { data: sessionData } = useSession();

  return (
    <ContentLayout title="Utilisateurs" icon={BsPeople} count={total} breadcrumb={BREADCRUMB_USERS}>
      <p>
        Liste des comptes utilisateurs. Dès qu'un utilisateur se connecte avec un nouveau service, un nouveau compte est automatiquement créé. De plus, vous avez la possibilité de créer manuellement
        des comptes utilisateurs. Notez que pour les comptes que vous créez vous-même, aucun service n'est lié donc personne ne pourra s'y connecter.
      </p>

      <div className="text-end mb-3">
        <Link href="/administration/utilisateurs/creation" passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Nouvel utilisateur
          </Button>
        </Link>
      </div>

      <DynamicPaginatedTable
        url="/api/users"
        params={(page, limit) => ({
          page,
          limit,
          include: ['user_linked_accounts'],
        })}
        columns={[
          detailsColumnFor((id) => `/administration/utilisateurs/${id}`),
          {
            title: 'Adresse email',
            render: ({ email }) => (
              <>
                <span className="font-monospace">{email}</span>
                {sessionData.user.email === email && <StarIndicator text="Il s'agit de votre compte" />}
              </>
            ),
          },
          {
            title: 'Nom',
            render: ({ name }) => name,
          },
          {
            title: 'Services reliés',
            render: ({ user_linked_accounts }) =>
              user_linked_accounts.length > 0 ? (
                user_linked_accounts.map(({ provider }) => {
                  const { icon: Icon, name: providerName } = providersData[provider];
                  return <Icon key={provider} className="icon mx-1" title={providerName} />;
                })
              ) : (
                <>(aucun)</>
              ),
            props: {
              className: 'text-center',
            },
          },
          {
            title: 'Date de création',
            render: ({ created_at: createdAt }) => renderDatetime(createdAt),
          },
        ]}
        totalCallback={(total) => setTotal(total)}
      />
    </ContentLayout>
  );
}

export default function AdminUsers() {
  return (
    <PrivateLayout>
      <AdminUsersLayout />
    </PrivateLayout>
  );
}
