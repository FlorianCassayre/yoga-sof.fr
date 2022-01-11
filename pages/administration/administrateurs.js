import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { BREADCRUMB_ADMINS, PaginatedTable, StarIndicator } from '../../components';
import { PrivateLayout } from '../../components/layout/admin';

export default function AdminAdmins({ pathname }) {
  const { data: session } = useSession();
  const [total, setTotal] = useState(null);
  const sessionEmail = session?.user.email;

  return (
    <PrivateLayout pathname={pathname} title="Administrateurs" count={total} breadcrumb={BREADCRUMB_ADMINS}>

      <p>
        Liste blanche des adresses emails autorisées à se connecter en tant qu'administrateur.
        Pour des raisons de sécurité, cette liste n'est pas directement modifiable depuis l'interface.
      </p>

      <PaginatedTable
        url="/api/admins"
        totalFrom={rows => rows.length}
        rowsFrom={rows => rows}
        paginationFrom={null}
        columns={[{
          title: 'Adresse email',
          render: ({ email }) => (
            <>
              <span className="font-monospace">{email}</span>
              {sessionEmail === email && (
                <StarIndicator text="Il s'agit de l'adresse de votre compte" />
              )}
            </>
          ),
        }]}
        totalCallback={total => setTotal(total)}
      />
    </PrivateLayout>
  );
}

AdminAdmins.getInitialProps = ({ pathname })  => {
  return { pathname };
}
