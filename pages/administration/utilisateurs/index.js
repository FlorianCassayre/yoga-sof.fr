import Link from 'next/link';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { BsPeople, BsPlusLg } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { detailsColumnFor, DynamicPaginatedTable, renderEmail } from '../../../components/table';

import { BREADCRUMB_USERS, providersData } from '../../../lib/client';
import { displayDatetime } from '../../../lib/common';

function AdminUsersLayout() {
  const [total, setTotal] = useState(null);

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
          include: ['accounts'],
        })}
        columns={[
          detailsColumnFor(id => `/administration/utilisateurs/${id}`),
          {
            title: 'Adresse email',
            render: ({ email }) => renderEmail(email),
          },
          {
            title: 'Nom',
            render: ({ name }) => name,
          },
          {
            title: 'Services reliés',
            render: ({ accounts }) => (accounts.length > 0 ? (
              accounts.map(({ provider }) => {
                const { icon: Icon, name: providerName } = providersData[provider];
                return <Icon key={provider} className="icon mx-1" title={providerName} />;
              })
            ) : (
              <>(aucun)</>
            )),
            props: { className: 'text-center' },
          },
          {
            title: 'Date de création',
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
        ]}
        totalCallback={newTotal => setTotal(newTotal)}
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
