import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { breadcrumbForUser, ErrorMessage } from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import { useDataApi } from '../../../hooks';


export default function AdminUser({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  const [{ isLoading, isError, data, error }] = useDataApi(`/api/users/${id}`, {
    include: 'registrations',
  });

  return (
    <PrivateLayout pathname={pathname} title={(
      <>
        Utilisateur
        {!isError && (!isLoading ? (
          ` ${data.name}`
        ) : (
          <Spinner animation="border" />
        ))}
      </>
    )} breadcrumb={breadcrumbForUser(id)}>

      {!isError ? (!isLoading ? (
        null // TODO
      ) : (
        <div className="m-5 text-center">
          <Spinner animation="border" />
        </div>
      )) : (
        <ErrorMessage error={error} />
      )}

    </PrivateLayout>
  );
}

AdminUser.getInitialProps = ({ pathname })  => {
  return { pathname };
}
