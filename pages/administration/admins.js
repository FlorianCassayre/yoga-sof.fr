import { useEffect } from 'react';
import { Badge, Spinner, Table } from 'react-bootstrap';
import { ErrorMessage } from '../../components/ErrorMessage';
import { PrivateLayout } from '../../components/layout/admin';
import { useDataApi } from '../../hooks/useDataApi';

export default function AdminAdmins({ pathname }) {
  const [{ data, isLoading, isError, error }] = useDataApi('/api/admins');

  return (
    <PrivateLayout pathname={pathname}>
      <h1 className="h4">
        Administrateurs
        {data && (
          <Badge pill bg="secondary" className="ms-2">{data.length}</Badge>
        )}
      </h1>

      <hr />

      <p>
        Liste blanche des adresses emails autorisées à se connecter en tant qu'administrateur.
        Pour des raisons de sécurité, cette liste n'est pas modifiable directement depuis l'interface.
      </p>

      {isLoading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" className="m-4" />
        </div>
      ) : isError ? (
        <ErrorMessage error={error} />
      ) : (
        <Table striped bordered>
          <thead>
          <tr>
            <th>Adresse email</th>
          </tr>
          </thead>
          <tbody>
          {data.map(({ email }, i) => (
            <tr key={i}>
              <td className="font-monospace">{email}</td>
            </tr>
          ))}
          </tbody>
        </Table>
      )}
    </PrivateLayout>
  )
}

AdminAdmins.getInitialProps = ({ pathname })  => {
  return { pathname };
}
