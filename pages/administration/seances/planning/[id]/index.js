import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { BsPencil, BsPlusLg, BsXOctagon } from 'react-icons/bs';
import Link from 'next/link';
import {
  breadcrumbForSessionPlanning, CancelSessionConfirmDialog,
  renderDatetime, renderSessionName, SessionStatusBadge,
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

  const isFuture = data && !data.is_canceled && new Date().getTime() < new Date(data.date_end).getTime();

  return (
    <ContentLayout
      pathname={pathname}
      title={data && (
        <>
          {renderSessionName(data)}
          <SessionStatusBadge session={data} className="ms-2" />
        </>
      )}
      headTitle={data && renderSessionName(data)}
      breadcrumb={data && breadcrumbForSessionPlanning(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      {isFuture && (
        <div className="mb-4">
          <Link href={`/administration/seances/planning/${id}/edition`} passHref>
            <Button className="me-2">
              <BsPencil className="icon me-2" />
              Modifier mes notes
            </Button>
          </Link>
          <CancelSessionConfirmDialog
            session={data}
            triggerer={clickHandler => (
              <Button variant="danger" onClick={clickHandler}>
                <BsXOctagon className="icon me-2" />
                Annuler cette séance
              </Button>
            )}
          />
        </div>
      )}

      <h2 className="h5">
        Participants
        <Badge bg="secondary" className="ms-2">{data && notCanceledRegistrations.length} / {data && data.slots}</Badge>
      </h2>

      <p>
        Liste des utilisateurs inscrits à cette séance et n'ayant pas annulé.
      </p>

      <StaticPaginatedTable
        rows={data && notCanceledRegistrations}
        columns={[
          userLinkColumn,
          registrationDateColumn,
        ]}
        renderEmpty={() => `Personne ne participe pour le moment.`}
      />

      {isFuture && (
        <div className="text-center">
          <Link href={{ pathname: '/administration/inscriptions/creation', query: { session_id: data && data.id } }} passHref>
            <Button variant="success">
              <BsPlusLg className="icon me-2" />
              Inscrire un utilisateur
            </Button>
          </Link>
        </div>
      )}

      <h2 className="h5">Annulations</h2>

      <p>Liste des annulations pour cette séance.</p>

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
