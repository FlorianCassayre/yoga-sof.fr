import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BsShieldLock } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { DynamicPaginatedTable, renderEmailCompare } from '../../components/table';
import { BREADCRUMB_ADMINS } from '../../lib/client';

function AdminAdminsLayout() {
  const { data: session } = useSession();
  const [total, setTotal] = useState(null);
  const sessionEmail = session?.user.email;

  return (
    <ContentLayout title="Administrateurs" icon={BsShieldLock} count={total} breadcrumb={BREADCRUMB_ADMINS}>

      <p>
        Liste blanche des adresses emails autorisées à se connecter en tant qu'administrateur.
        Pour des raisons de sécurité, cette liste n'est pas directement modifiable depuis l'interface.
      </p>

      <DynamicPaginatedTable
        url="/api/admins"
        totalFrom={rows => rows.length}
        rowsFrom={rows => rows}
        paginationFrom={null}
        columns={[{
          title: 'Adresse e-mail',
          render: ({ email }) => renderEmailCompare(sessionEmail)(email),
        }]}
        totalCallback={total => setTotal(total)}
      />
    </ContentLayout>
  );
}

export default function AdminAdmins() {
  return (
    <PrivateLayout>

      <AdminAdminsLayout />

    </PrivateLayout>
  );
}
