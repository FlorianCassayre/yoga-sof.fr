import { useSession } from 'next-auth/react';
import React, { useMemo } from 'react';
import {
  Button,
  Container,
  Form,
  FormControl,
  InputGroup,
  OverlayTrigger,
  Popover,
  Spinner,
  Table,
} from 'react-bootstrap';
import { BsCalendar, BsClipboard, BsXOctagon } from 'react-icons/bs';
import {
  AuthGuard,
  ErrorMessage, formatDayRange,
  formatTimestamp,
  SESSIONS_TYPES,
  USER_TYPE_ADMIN,
  USER_TYPE_REGULAR,
} from '../components';
import { PublicLayout } from '../components/layout/public';
import { useDataApi } from '../hooks';

const MesCoursLayout = () => {
  const [{ isLoading, isError, data, error }] = useDataApi('/api/self/registrations');

  const [registrationsFuture, registrationsPast, registrationsCanceled] = useMemo(() => {
    if(data) {
      const now = new Date();
      const notCanceled = data.filter(({ is_user_canceled: isCanceled }) => !isCanceled);
      return [
        notCanceled.filter(({ session: { date_end: dateEnd } }) => now.getTime() <= new Date(dateEnd).getTime()),
        notCanceled.filter(({ session: { date_end: dateEnd } }) => now.getTime() > new Date(dateEnd).getTime()),
        data.filter(({ is_user_canceled: isCanceled }) => isCanceled),
      ];
    } else {
      return [];
    }
  }, [data]);


  const renderTable = ({ rows, cancellation = false, cancellable = false, emptyMessage }) => !isError ? (!isLoading ? (rows.length > 0 ? (
    <Table striped bordered responsive className="mt-2 mb-5 text-center">
      <thead>
      <tr>
        <th>Séance</th>
        <th>Date et horaire</th>
        <th>Date d'inscription</th>
        {cancellable && (
          <th>Action</th>
        )}
        {cancellation && (
          <th>Date d'annulation</th>
        )}
      </tr>
      </thead>
      <tbody className="align-middle">
      {rows.map(({ id, created_at: registeredAt, canceled_at: canceledAt, session: { type, date_start: dateStart, date_end: dateEnd } }) => (
        <tr key={id}>
          <td>{SESSIONS_TYPES.filter(({ id }) => id === type)[0].title}</td>
          <td>{formatDayRange(dateStart, dateEnd)}</td>
          <td>{formatTimestamp(registeredAt)}</td>
          {cancellable && (
            <td className="text-center">
              <Button variant="danger" size="sm">
                <BsXOctagon className="icon me-2" />
                Annuler
              </Button>
            </td>
          )}
          {cancellation && (
            <td>{canceledAt}</td>
          )}
        </tr>
      ))}
      </tbody>
    </Table>
  ) : (
    <div className="my-4 text-center">
      {emptyMessage}
    </div>
  )) : (
    <div className="m-5 text-center">
      <Spinner animation="border" />
    </div>
  )) : (
    <ErrorMessage />
  );

  const { data: session } = useSession();

  const ButtonICSLink = () => {
    const url = `${window.location.origin}/api/calendar.ics?id=${session.user.db_id}&token=${session.user.public_access_token}`;
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
      <OverlayTrigger trigger="click" placement="top" rootClose overlay={(
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
      )}>
        <Button variant="secondary">
          <BsCalendar className="icon me-2" />
          Exporter le calendrier
        </Button>
      </OverlayTrigger>
    );
  };

  return (
    <Container>
      <h1 className="mt-4">Mes inscriptions</h1>

      <h2 className="h3">Séances à venir</h2>

      <div className="text-end">
        <ButtonICSLink />
      </div>


      {renderTable({ rows: registrationsFuture, cancellable: true, emptyMessage: 'Pas de séances à venir.' })}

      <h2 className="h3">Séances passées</h2>
      {renderTable({ rows: registrationsPast, emptyMessage: 'Pas de séances passées.' })}

      <h2 className="h3">Annulations</h2>
      {renderTable({ rows: registrationsCanceled, cancellation: true, emptyMessage: 'Pas d\'annulations.' })}

    </Container>
  )
};

export default function MesCours({ pathname }) {
  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_REGULAR, USER_TYPE_ADMIN]}>
      <PublicLayout pathname={pathname} padNavbar>
        <MesCoursLayout />
      </PublicLayout>
    </AuthGuard>
  );
}

MesCours.getInitialProps = ({ pathname })  => {
  return { pathname };
}
