import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { BsEyeFill } from 'react-icons/bs';
import { BREADCRUMB_USERS, formatTimestamp, DynamicPaginatedTable, providersData, StarIndicator } from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import Link from 'next/link';

export default function AdminUsers({ pathname }) {
  const [total, setTotal] = useState(null);

  const { data: sessionData } = useSession();

  return (
    <PrivateLayout pathname={pathname} title="Utilisateurs" count={total} breadcrumb={BREADCRUMB_USERS}>

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
          {
            title: '#',
            render: ({ id }) => id,
          },
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
            render: ({ updated_at: updatedAt }) => formatTimestamp(updatedAt),
          },
          {
            title: 'Première activité',
            render: ({ created_at: createdAt }) => formatTimestamp(createdAt),
          },
          {
            title: 'Identifiant du service',
            render: ({ id_provider: idProvider }) => <span className="font-monospace">{idProvider}</span>,
          },
          {
            title: 'Détails',
            render: ({ id }) => (
              <Link href={`/administration/utilisateurs/${id}`} passHref>
                <Button variant="secondary" size="sm">
                  <BsEyeFill className="icon" />
                </Button>
              </Link>
            ),
            props: {
              className: 'text-center',
            },
          }
        ]}
        totalCallback={total => setTotal(total)}
      />

    </PrivateLayout>
  );
}

AdminUsers.getInitialProps = ({ pathname })  => {
  return { pathname };
}
