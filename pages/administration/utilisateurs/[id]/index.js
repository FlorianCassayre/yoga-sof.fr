import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Alert, Badge, Button } from 'react-bootstrap';
import { BsCheckLg, BsPencil, BsPerson, BsPlusLg, BsShieldFillExclamation } from 'react-icons/bs';
import { ConfirmDialog } from '../../../../components';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { DynamicPaginatedTable, StaticPaginatedTable, cancelRegistrationColumn, plannedCourseLinkColumn } from '../../../../components/table';
import { usePromiseEffect } from '../../../../hooks';
import { breadcrumbForUser, providersData } from '../../../../lib/client';
import { getUser, postUserDisabled } from '../../../../lib/client/api';
import { displayDatetime, displayUserName, formatTimestamp } from '../../../../lib/common';
import { useNotificationsContext, useRefreshContext } from '../../../../state';

function AdminUserLayout({ id }) {
  const refresh = useRefreshContext();
  const { notify } = useNotificationsContext();

  const { isLoading, isError, data, error } = usePromiseEffect(() => getUser(id, { include: ['courseRegistrations', 'accounts'] }), []);

  return (
    <ContentLayout title={`Utilisateur ${data && displayUserName(data)}`} icon={BsPerson} breadcrumb={data && breadcrumbForUser(data)} isLoading={isLoading} isError={isError} error={error}>
      {data && data.disabled && (
        <Alert variant="danger">
          <BsShieldFillExclamation className="icon me-2" />
          Vous avez désactivé le compte de cet utilisateur.
          {' '}
          <ConfirmDialog
            title="Réactiver le compte utilisateur"
            description={(
              <>
                Souhaitez-vous réactiver le compte de l'utilisateur
                {' '}
                {displayUserName(data)}
                {' '}
                ? Cet utilisateur pourra à nouveau se servir de son compte.
              </>
            )}
            variant="danger"
            icon={BsCheckLg}
            action="Confirmer"
            triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
              <Alert.Link href="#" onClick={clickHandler}>
                Le réactiver ?
              </Alert.Link>
            )}
            confirmPromise={() => postUserDisabled(data.id, { disabled: false })}
            onSuccess={() => {
              notify({
                title: 'Réactivation utilisateur',
                body: `L'utilisateur ${displayUserName(data)} a été réactivé.`,
              });

              refresh();
            }}
          />
        </Alert>
      )}

      <div className="mb-3">
        <Link href={`/administration/utilisateurs/${id}/edition`} passHref>
          <Button className="me-2">
            <BsPencil className="icon me-2" />
            Modifier
          </Button>
        </Link>
      </div>

      <h2 className="h5">Inscriptions</h2>
      <p>Les inscriptions (et désinscriptions) de cet utilisateur.</p>

      <DynamicPaginatedTable
        url="/api/courseRegistrations"
        params={(page, limit, { sort }) => ({
          page,
          limit,
          where: { userId: parseInt(id) },
          orderBy: sort ? { [sort.column]: sort.order ? '$asc' : '$desc' } : undefined,
          include: ['course', 'user'],
        })}
        columns={[
          { ...plannedCourseLinkColumn, name: 'course.dateStart', sortable: true },
          {
            title: `Date d'inscription`,
            name: 'createdAt',
            sortable: true,
            initialSortValue: false,
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
          {
            title: 'Statut',
            name: 'canceledAt',
            sortable: true,
            render: ({ isUserCanceled, canceledAt }) => (!isUserCanceled ? <Badge bg="success">Inscrit</Badge> : (
              <Badge bg="danger">
                Désinscrit à
                {' '}
                {formatTimestamp(canceledAt)}
              </Badge>
            )),
            props: { className: 'text-center' },
          },
          cancelRegistrationColumn,
        ]}
        renderEmpty={() => 'Cet utilisateur ne s\'est pas encore inscrit à une séance.'}
      />

      <div className="text-center mb-3">
        <Link href={{ pathname: '/administration/inscriptions/creation', query: { userId: data && data.id } }} passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire cet utilisateur à une séance
          </Button>
        </Link>
      </div>

      <h2 className="h5">Absences</h2>
      <p>Les absences de cet utilisateur. Cela correspond aux séances pour lesquelles l'utilisateur était inscrit mais a été marqué comme absent.</p>

      <DynamicPaginatedTable
        url="/api/courseRegistrations"
        params={(page, limit, { sort }) => ({
          page,
          limit,
          where: {
            userId: parseInt(id),
            isUserCanceled: false,
            course: {
              isCanceled: false,
            },
            attended: false,
          },
          orderBy: sort ? { [sort.column]: sort.order ? '$asc' : '$desc' } : undefined,
          include: ['course', 'user'],
        })}
        columns={[
          { ...plannedCourseLinkColumn, name: 'course.dateStart', sortable: true, initialSortValue: false },
          {
            title: `Date d'inscription`,
            name: 'createdAt',
            sortable: true,
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
        ]}
        renderEmpty={() => `Cet utilisateur n'a aucune absence enregistrée.`}
      />

      <h2 className="h5">Informations de connexion</h2>

      {data && data.customEmail && (
        <div>
          Adresse email préférée (non vérifiée) :
          {' '}
          <Badge bg="secondary">{data.customEmail}</Badge>
        </div>
      )}
      <div className="mb-2">
        Adresse email :
        {' '}
        <Badge bg="secondary">{data && (data.email || '(aucune)')}</Badge>
      </div>

      <StaticPaginatedTable
        rows={data && [...(data.emailVerified ? [{ provider: 'email', providerAccountId: data.email }] : []), ...data.accounts]}
        columns={[
          {
            title: 'Service',
            render: ({ provider }) => {
              const { icon: Icon, name: providerName } = providersData[provider];
              return <Icon className="icon" title={providerName} />;
            },
            props: { className: 'text-center' },
          },
          {
            title: 'Identifiant du service',
            render: ({ providerAccountId }) => providerAccountId,
            props: { className: 'font-monospace' },
          },
          {
            title: 'Dernière connexion',
            render: ({ updatedAt }) => updatedAt && displayDatetime(updatedAt),
          },
          {
            title: 'Première connexion',
            render: ({ createdAt }) => createdAt && displayDatetime(createdAt),
          },
        ]}
        renderEmpty={() => `Aucun service de connexion enregistré. Cet utilisateur n'a donc pas la possibilité de se connecter à ce compte pour le moment.`}
      />

      <ConfirmDialog
        title="Désactiver le compte utilisateur"
        description={(
          <>
            Souhaitez-vous désactiver le compte de l'utilisateur
            {' '}
            {data && displayUserName(data)}
            {' '}
            ? Cet utilisateur ne sera plus en mesure de se servir de son compte.
          </>
        )}
        variant="danger"
        icon={BsCheckLg}
        action="Confirmer"
        triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
          <div className="text-end">
            <Button variant="outline-danger" onClick={clickHandler}>
              <BsShieldFillExclamation className="icon me-2" />
              Désactiver le compte
            </Button>
          </div>
        )}
        confirmPromise={() => postUserDisabled(data.id, { disabled: true })}
        onSuccess={() => {
          notify({
            title: 'Désactivation utilisateur',
            body: `L'utilisateur ${displayUserName(data)} a été désactivé.`,
          });

          refresh();
        }}
      />
    </ContentLayout>
  );
}

export default function AdminUser() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <AdminUserLayout id={id} />
    </PrivateLayout>
  );
}
