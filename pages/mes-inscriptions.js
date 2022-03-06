import { useSession } from 'next-auth/react';
import React, { useMemo } from 'react';
import { Button, Container, Form, InputGroup, OverlayTrigger, Popover, Spinner, Table } from 'react-bootstrap';
import { BsCalendar, BsClipboard, BsXOctagon } from 'react-icons/bs';
import { AuthGuard, ConfirmDialog, ErrorMessage } from '../components';
import { UserSelfForm } from '../components/form';
import { PublicLayout } from '../components/layout/public';
import { displayCourseName,
  USER_TYPE_ADMIN,
  USER_TYPE_REGULAR,
  formatDayRange,
  formatTimestamp,
  SESSIONS_NAMES } from '../lib/common';
import { usePromiseEffect } from '../hooks';
import { getSelfRegistrations, postSelfCancelRegistration } from '../lib/client/api';
import { useNotificationsContext, useRefreshContext } from '../state';

function ButtonICSLink({ session }) {
  const url = `${window.location.origin}/api/calendar.ics?id=${session.userId}&token=${session.publicAccessToken}`;
  const inputId = 'input-popover-copy-link';
  const selectInput = () => {
    const input = document.getElementById(inputId);
    input.select();
  };
  const buttonClickHandler = () => {
    selectInput();
    document.execCommand('copy');
  };
  const inputClickHandler = () => selectInput();
  return (
    <OverlayTrigger
      trigger="click"
      placement="top"
      rootClose
      overlay={(
        <Popover id="popover-copy-link">
          <Popover.Header as="h3">Lien vers mon calendrier</Popover.Header>
          <Popover.Body>
            <Form.Group>
              <InputGroup>
                <Form.Control id={inputId} value={url} readOnly onClick={inputClickHandler} />
                <Button variant="outline-secondary" onClick={buttonClickHandler}>
                  <BsClipboard className="icon" />
                </Button>
              </InputGroup>
            </Form.Group>
          </Popover.Body>
        </Popover>
      )}
    >
      <Button variant="secondary" className="mb-2">
        <BsCalendar className="icon me-2" />
        Exporter le calendrier
      </Button>
    </OverlayTrigger>
  );
}

function MesCoursLayout() {
  const refresh = useRefreshContext();
  const { notify } = useNotificationsContext();

  const { isLoading, isError, data } = usePromiseEffect(getSelfRegistrations, []);

  const [registrationsFuture, registrationsPast, registrationsCanceled] = useMemo(() => {
    if (data) {
      const now = new Date();
      const notCanceled = data.filter(({ isUserCanceled, course: { isCanceled } }) => !isCanceled && !isUserCanceled);
      return [
        notCanceled.filter(({ course: { dateEnd } }) => now.getTime() <= new Date(dateEnd).getTime()),
        notCanceled.filter(({ course: { dateEnd } }) => now.getTime() > new Date(dateEnd).getTime()),
        data.filter(({ isUserCanceled, course: { isCanceled } }) => isCanceled || isUserCanceled),
      ];
    }
    return [];
  }, [data]);

  const renderTable = ({ rows, cancellation = false, cancellable = false, emptyMessage }) => (!isError ? (
    !isLoading ? (
      rows.length > 0 ? (
        <Table striped bordered responsive className="mt-2 mb-5 text-center">
          <thead>
            <tr>
              <th>Séance</th>
              <th>Date et horaire</th>
              <th>Date d'inscription</th>
              {cancellable && <th>Action</th>}
              {cancellation && <th>Détails</th>}
            </tr>
          </thead>
          <tbody className="align-middle">
            {rows.map(registration => {
              const { id, createdAt: registeredAt, isUserCanceled, canceledAt: userCanceledAt, course } = registration;
              const { type, dateStart, dateEnd } = course;
              return (
                <tr key={id}>
                  <td>{SESSIONS_NAMES[type]}</td>
                  <td>{formatDayRange(dateStart, dateEnd)}</td>
                  <td>{formatTimestamp(registeredAt)}</td>
                  {cancellable && (
                  <td className="text-center">
                    <ConfirmDialog
                      title="Annuler l'inscription à une séance"
                      description={(
                        <>
                          Vous êtes sur le point d'annuler votre inscription à la séance suivante :
                          <ul>
                            <li>{displayCourseName(course)}</li>
                          </ul>
                          Vous pourrez à tout moment vous y réinscrire, s'il reste de la place.
                        </>
                          )}
                      variant="danger"
                      icon={BsXOctagon}
                      action="Confirmer ma désinscription"
                      triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
                        <Button variant="danger" size="sm" onClick={clickHandler}>
                          <BsXOctagon className="icon me-2" />
                          Désinscription
                        </Button>
                      )}
                      confirmPromise={() => postSelfCancelRegistration(id)}
                      onSuccess={() => {
                        notify({
                          title: 'Désinscription confirmée',
                          body: `Vous vous êtes désinscrit de la ${displayCourseName(course, false)}.`,
                        });

                        refresh();
                      }}
                    />
                  </td>
                  )}
                  {cancellation && (
                    <td>
                      {isUserCanceled ? (
                        <>
                          Vous vous êtes désinscrit (
                          {formatTimestamp(userCanceledAt)}
                          )
                        </>
                      ) : <>La séance a été annulée</>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <div className="my-4 text-center">{emptyMessage}</div>
      )
    ) : (
      <div className="m-5 text-center">
        <Spinner animation="border" />
      </div>
    )
  ) : (
    <ErrorMessage />
  ));

  const { data: session } = useSession();

  return (
    <Container>
      <h1 className="mt-4">Mes inscriptions</h1>

      <h2 className="h3">Séances à venir</h2>

      <div className="text-end">
        <ButtonICSLink session={session} />
      </div>

      {renderTable({ rows: registrationsFuture, cancellable: true, emptyMessage: 'Pas de séances à venir.' })}

      <h2 className="h3">Séances passées</h2>
      {renderTable({ rows: registrationsPast, emptyMessage: 'Pas de séances passées.' })}

      <h2 className="h3">Annulations</h2>
      {renderTable({ rows: registrationsCanceled, cancellation: true, emptyMessage: `Pas d'annulations.` })}

      <h2 className="h3">Données personnelles</h2>
      <p>Votre adresse email nous permet notamment de vous informer en cas d'annulation de séance.</p>
      <div className="mb-4">
        <UserSelfForm />
      </div>
    </Container>
  );
}

export default function MesCours() {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_REGULAR, USER_TYPE_ADMIN]}>
      <PublicLayout padNavbar title="Mes inscriptions">
        <MesCoursLayout />
      </PublicLayout>
    </AuthGuard>
  );
}
