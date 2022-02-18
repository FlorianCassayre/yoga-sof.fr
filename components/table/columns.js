import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { BsCalendarDate, BsEyeFill, BsPerson, BsXOctagon } from 'react-icons/bs';
import { CancelRegistrationConfirmDialog } from '../CancelRegistrationConfirmDialog';
import { dateFormat, formatDayRange, formatTimestamp, SESSIONS_TYPES } from '../../lib/common';
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
  render: ({ user_id, user: { name } }) => (
    <Link href={`/administration/utilisateurs/${user_id}`} passHref>
      <a>
        <BsPerson className="icon me-2" />
        {name}
      </a>
    </Link>
  ),
};

export const renderSessionName = ({ type, date_start: dateStart, date_end: dateEnd }, capitalize = true) => [capitalize ? 'Séance' : 'séance', SESSIONS_TYPES.filter(({ id }) => id === type)[0].title.toLowerCase(), 'du', formatDayRange(dateStart, dateEnd)].join(' ');

export const plannedSessionLinkColumn = {
  title: 'Séance',
  render: ({ session_id, session }) => (
    <Link href={`/administration/seances/planning/${session_id}`} passHref>
      <a>
        <BsCalendarDate className="icon me-2" />
        {renderSessionName(session)}
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
        triggerer={clickHandler => (
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

// eslint-disable-next-line react/display-name
export const renderEmailCompare = emailOther => function (email) {
  return (
    <>
      <span className="font-monospace">{email}</span>
      {emailOther != null && emailOther === email && <StarIndicator text="Il s'agit de votre compte" />}
    </>
  );
};

export const renderEmail = renderEmailCompare(null);

export const renderDateOnly = date => format(new Date(date), dateFormat);

export const renderDatetime = date => formatTimestamp(date);

export const renderSessionType = type => SESSIONS_TYPES.find(({ id }) => id === type).title;

export const renderTimePeriod = (dateStart, dateEnd) => (
  <>
    {format(new Date(dateStart), "HH'h'mm")}
    {' '}
    à
    {format(new Date(dateEnd), "HH'h'mm")}
  </>
);
