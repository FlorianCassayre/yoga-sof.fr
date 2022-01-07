import { useSession } from 'next-auth/react';
import { Badge, Button, Spinner, Table } from 'react-bootstrap';
import { BsSearch } from 'react-icons/all';
import { providersData, StarIndicator } from '../../components';
import { ErrorMessage } from '../../components';
import { PrivateLayout } from '../../components/layout/admin';
import { useDataApi } from '../../hooks';

export default function AdminUsers({ pathname }) {
  const [{ data, isLoading, isError, error }] = useDataApi('/api/users');

  const { data: sessionData } = useSession();

  const locale = 'fr-FR';
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
  const formatTimestamp = timestamp => {
    const dt = new Date(timestamp);
    return [timeFormatter, dateFormatter].map(formatter => formatter.format(dt)).join(' le ');
  }

  return (
    <PrivateLayout pathname={pathname}>
      <h1 className="h4">
        Utilisateurs
        {data && (
          <Badge pill bg="secondary" className="ms-2">{data.length}</Badge>
        )}
      </h1>

      <hr />

      <p>
        Liste des utilisateurs s'étant connectés au moins une fois au site.
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
            <th>#</th>
            <th>Service</th>
            <th>Adresse email</th>
            <th>Nom</th>
            <th>Dernière activité</th>
            <th>Première connexion</th>
            <th>Identifiant du service</th>
            <th>Détails</th>
          </tr>
          </thead>
          <tbody className="align-middle">
          {data.map(({ id, id_provider: idProvider, email, provider, name, created_at: createdAt, updated_at: updatedAt }, i) => {
            const { icon: Icon, name: providerName } = providersData[provider];
            return (
              <tr key={i}>
                <td className="font-monospace">{id}</td>
                <td className="text-center"><Icon className="icon" title={providerName} /></td>
                <td className="font-monospace">
                  {email}
                  {email === sessionData.user.email && (
                    <StarIndicator key={id} text="Votre compte" />
                  )}
                </td>
                <td>{name}</td>
                <td>{formatTimestamp(createdAt)}</td>
                <td>{formatTimestamp(updatedAt)}</td>
                <td className="font-monospace">{idProvider}</td>
                <td className="text-center">
                  <Button variant="secondary" disabled size="sm">
                    <BsSearch className="icon" />
                  </Button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      )}
    </PrivateLayout>
  );
}

AdminUsers.getInitialProps = ({ pathname })  => {
  return { pathname };
}
