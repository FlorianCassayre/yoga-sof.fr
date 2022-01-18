import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { BsCalendarDate, BsEyeFill, BsPerson } from 'react-icons/bs';
import * as url from 'url';
import { dateFormat, formatDayRange, formatTimestamp } from '../date';
import { SESSIONS_TYPES } from '../sessions';
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

export const renderSessionName = ({ type, date_start: dateStart, date_end: dateEnd }) =>
  ['Séance', SESSIONS_TYPES.filter(({ id }) => id === type)[0].title.toLowerCase(), 'du', formatDayRange(dateStart, dateEnd)].join(' ');

export const plannedSessionLinkColumn = {
  title: 'Séance',
  render: ({ session_id, session }) => (
    <Link href={`/administration/seances/planning/${session_id}`} passHref>
      <a>
        <BsCalendarDate className="icon me-2" />
        {renderSessionName(session)}
      </a>
    </Link>
  )
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
  props: {
    className: 'text-center',
  },
});

export const renderEmailCompare = emailOther => email => (
  <>
    <span className="font-monospace">{email}</span>
    {emailOther != null && emailOther === email && (
      <StarIndicator text="Il s'agit de votre compte" />
    )}
  </>
);

export const renderEmail = renderEmailCompare(null);

export const renderDateOnly = date => format(new Date(date), dateFormat);

export const renderDatetime = date => formatTimestamp(date);
