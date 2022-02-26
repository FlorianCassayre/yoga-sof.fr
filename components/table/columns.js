import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { BsCalendarDate, BsEyeFill, BsPerson, BsXOctagon } from 'react-icons/bs';
import { displaySessionName } from '../../lib/common';
import { CancelRegistrationConfirmDialog } from '../CancelRegistrationConfirmDialog';
import { SessionStatusBadge } from '../SessionStatusBadge';
import { StarIndicator } from '../StarIndicator';

const compose = f => g => x => f(g(x));

export const adaptColumn = f => ({ render, ...column }) => ({
  render: data => compose(render)(f)(data),
  ...column,
});

export const idColumn = {
  title: '#',
  render: ({ id }) => id,
};

export const userLinkColumn = {
  title: 'Utilisateur',
  render: ({ user_id: userId, user: { name } }) => (
    <Link href={`/administration/utilisateurs/${userId}`} passHref>
      <a>
        <BsPerson className="icon me-2" />
        {name}
      </a>
    </Link>
  ),
};

export const plannedSessionLinkColumn = {
  title: 'Séance',
  render: ({ session_id: sessionId, session }) => (
    <Link href={`/administration/seances/planning/${sessionId}`} passHref>
      <a>
        <BsCalendarDate className="icon me-2" />
        {displaySessionName(session)}
        <SessionStatusBadge session={session} className="ms-2" />
      </a>
    </Link>
  ),
};

export const cancelRegistrationColumn = {
  title: 'Désinscription',
  render: registration => !registration.session.is_canceled
    && !registration.is_user_canceled && (
      <CancelRegistrationConfirmDialog
        registration={registration}
        triggerer={clickHandler => ( // eslint-disable-line react/no-unstable-nested-components
          <Button size="sm" variant="danger" onClick={clickHandler}>
            <BsXOctagon className="icon" />
          </Button>
        )}
      />
  ),
  props: { className: 'text-center' },
};

export const detailsColumnFor = urlFor => ({
  title: 'Détails',
  render: ({ id }) => (
    <Link href={urlFor(id)} passHref>
      <Button variant="secondary" size="sm">
        <BsEyeFill className="icon" />
      </Button>
    </Link>
  ),
  props: { className: 'text-center' },
});

// eslint-disable-next-line
export const renderEmailCompare = emailOther => function (email) {
  return (
    <>
      <span className="font-monospace">{email}</span>
      {emailOther != null && emailOther === email && <StarIndicator text="Il s'agit de votre compte" />}
    </>
  );
};

export const renderEmail = renderEmailCompare(null);
