import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import {
  breadcrumbForSessionPlanning,
  renderDatetime,
  StaticPaginatedTable,
  userLinkColumn,
} from '../../../../../components';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { useDataApi } from '../../../../../hooks';

function SessionViewLayout({ pathname, id }) {
  const [{ isLoading, isError, data, error }] = useDataApi(`/api/sessions/${id}`, { include: ['registrations.user'] });

  const registrationDateColumn = {
    title: `Date d'inscription`,
    render: ({ created_at: createdAt }) => renderDatetime(createdAt),
  };

  const sortedRegistrations = useMemo(() => {
    return data && data.registrations.slice().sort(({ created_at: t1 }, { created_at: t2 }) => new Date(t2).getTime() - new Date(t1).getTime());
  }, [data]);
  const [notCanceledRegistrations, canceledRegistrations] = useMemo(() => {
    return sortedRegistrations ? [sortedRegistrations.filter(({ is_user_canceled: isCanceled }) => !isCanceled), sortedRegistrations.filter(({ is_user_canceled: isCanceled }) => isCanceled)] : [];
  }, [sortedRegistrations]);

  return (
    <ContentLayout
      pathname={pathname}
      title="Séance"
      breadcrumb={data && breadcrumbForSessionPlanning(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      <h2 className="h5">
        Participants
        <Badge bg="secondary" className="ms-2">{data && notCanceledRegistrations.length} / {data && data.slots}</Badge>
      </h2>

      <p>Liste des utilisateurs inscrits à cette séance et n'ayant pas annulé.</p>

      <StaticPaginatedTable
        rows={data && notCanceledRegistrations}
        columns={[
          userLinkColumn,
          registrationDateColumn,
        ]}
        renderEmpty={() => `Personne ne participe pour le moment.`}
      />

      <h2 className="h5">Annulations</h2>

      <p>Liste des annulations à cette séance.</p>

      <StaticPaginatedTable
        rows={data && canceledRegistrations}
        columns={[
          userLinkColumn,
          registrationDateColumn,
          {
            title: `Date d'annulation`,
            render: ({ canceled_at: canceledAt }) => renderDatetime(canceledAt),
          },
        ]}
        renderEmpty={() => `Aucun utilisateur n'a annulé.`}
      />
    </ContentLayout>
  );
}

export default function SessionView({ pathname }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout pathname={pathname}>

      <SessionViewLayout pathname={pathname} id={id} />

    </PrivateLayout>
  );
}

SessionView.getInitialProps = ({ pathname })  => {
  return { pathname };
}
