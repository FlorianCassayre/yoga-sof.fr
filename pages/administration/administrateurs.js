import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';
import { DynamicPaginatedTable, renderEmailCompare } from '../../components/table';
import { BREADCRUMB_ADMINS } from '../../lib/client';

function AdminAdminsLayout({ pathname }) {
  const { data: session } = useSession();
  const [total, setTotal] = useState(null);
  const sessionEmail = session?.user.email;

  return (
    <ContentLayout pathname={pathname} title="Administrateurs" count={total} breadcrumb={BREADCRUMB_ADMINS}>

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

export default function AdminAdmins({ pathname }) {
  return (
    <PrivateLayout pathname={pathname}>

      <AdminAdminsLayout pathname={pathname} />

    </PrivateLayout>
  );
}

AdminAdmins.getInitialProps = ({ pathname })  => {
  return { pathname };
}
