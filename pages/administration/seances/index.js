import { useMemo } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar, BsPlusLg } from 'react-icons/bs';
import { BREADCRUMB_SESSIONS, SESSIONS_TYPES, SessionsCards, WEEKDAYS } from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';
import { useDataApi } from '../../../hooks';
import Link from 'next/link';

export default function AdminSeances({ pathname }) {

  const [{ isLoading, isError, data, error }] = useDataApi('/api/session_models');

  const dataKV = useMemo(() => data && Object.fromEntries(data.map(obj => [obj.type, obj])), [data]);

  return (
    <PrivateLayout pathname={pathname} title="Séances" breadcrumb={BREADCRUMB_SESSIONS}>

      <p>
        Ci-dessous, les modèles de séances.
        Il s'agit des horaires normales de déroulement des séances et seront affichées sur le site.
        Il reste possible de planifier des séances à d'autres dates et horaires.
      </p>

      <SessionsCards />

    </PrivateLayout>
  );
}

AdminSeances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
