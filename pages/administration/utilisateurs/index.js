import { useSession } from 'next-auth/react';
import { useState } from 'react';
import {
  BREADCRUMB_USERS,
  DynamicPaginatedTable,
  providersData,
  StarIndicator,
  renderDatetime, detailsColumnFor,
} from '../../../components';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';

function AdminUsersLayout({ pathname }) {
  const [total, setTotal] = useState(null);

  const { data: sessionData } = useSession();

  return (
    <ContentLayout pathname={pathname} title="Utilisateurs" count={total} breadcrumb={BREADCRUMB_USERS}>

      <p>
        Liste des utilisateurs s'étant connectés au moins une fois au site.
      </p>

      <DynamicPaginatedTable
        url="/api/users"
        params={(page, limit) => ({
          page,
          limit,
        })}
        columns={[
          detailsColumnFor(id => `/administration/utilisateurs/${id}`),
          {
            title: 'Service',
            render: ({ provider }) => {
              const { icon: Icon, name: providerName } = providersData[provider];
              return <Icon className="icon" title={providerName} />;
            },
            props: {
              className: 'text-center',
            },
          },
          {
            title: 'Adresse email',
            render: ({ email }) => (
              <>
                <span className="font-monospace">{email}</span>
                {sessionData.user.email === email && (
                  <StarIndicator text="Il s'agit de votre compte" />
                )}
              </>
            ),
          },
          {
            title: 'Nom',
            render: ({ name }) => name,
          },
          {
            title: 'Dernière activité',
            render: ({ updated_at: updatedAt }) => renderDatetime(updatedAt),
          },
          {
            title: 'Première activité',
            render: ({ created_at: createdAt }) => renderDatetime(createdAt),
          },
          {
            title: 'Identifiant du service',
            render: ({ id_provider: idProvider }) => <span className="font-monospace">{idProvider}</span>,
          },
        ]}
        totalCallback={total => setTotal(total)}
      />

    </ContentLayout>
  );
}

export default function AdminUsers({ pathname }) {

  return (
    <PrivateLayout pathname={pathname}>

      <AdminUsersLayout pathname={pathname} />

    </PrivateLayout>
  );
}

AdminUsers.getInitialProps = ({ pathname })  => {
  return { pathname };
}
