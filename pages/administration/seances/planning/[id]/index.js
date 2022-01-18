import { useRouter } from 'next/router';
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

  return (
    <ContentLayout
      pathname={pathname}
      title="Séance"
      breadcrumb={data && breadcrumbForSessionPlanning(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      <h2 className="h5">Participants</h2>

      <p>Liste des utilisateurs inscrits à cette séance et n'ayant pas annulé.</p>

      <StaticPaginatedTable
        rows={data && data.registrations.filter(({ is_user_canceled: isCanceled }) => !isCanceled)}
        columns={[
          userLinkColumn,
          registrationDateColumn,
        ]}
        renderEmpty={() => `Aucun participant ne participe pour le moment.`}
      />

      <h2 className="h5">Annulations</h2>

      <p>Liste des annulations à cette séance.</p>

      <StaticPaginatedTable
        rows={data && data.registrations.filter(({ is_user_canceled: isCanceled }) => isCanceled)}
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
