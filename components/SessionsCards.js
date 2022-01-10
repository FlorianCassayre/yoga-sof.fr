import Link from 'next/link';
import { useMemo } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar, BsPencil, BsPlusLg } from 'react-icons/bs';
import { useDataApi } from '../hooks';
import { formatTime, WEEKDAYS } from './date';
import { ErrorMessage } from './ErrorMessage';
import { SESSIONS_TYPES } from './sessions';

export function SessionsCards() {
  const [{ isLoading, isError, data, error }] = useDataApi('/api/session_models');

  const dataKV = useMemo(() => data && Object.fromEntries(data.map(obj => [obj.id, obj])), [data]);

  return (
    <Row>
      {!isError ? (!isLoading ?
        SESSIONS_TYPES.map(({ id, title }) => {
          const sessionData = dataKV[id];

          return (
            <Col key={id}>
              {sessionData != null ? (
                <Card>
                  <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Le <strong>{WEEKDAYS[sessionData.weekday].toLowerCase()}</strong> de <strong>{formatTime(sessionData.time_start)} à {formatTime(sessionData.time_end)}</strong>
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      <strong>{sessionData.spots}</strong> places
                    </Card.Subtitle>
                    <Card.Text>

                    </Card.Text>
                    <span className="d-block text-end">
                      <Link href={`/administration/seances/${id}/edition`} passHref>
                        <Button size="sm">
                          <BsPencil className="icon me-2" />
                          Modifier
                        </Button>
                      </Link>
                    </span>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="py-5 text-center">
                  <Card.Text>
                      <span className="d-block h1 mb-3">
                        <BsCalendar />
                      </span>
                    <Link href={`/administration/seances/creation`} passHref>
                      <Button variant="success">
                        <BsPlusLg className="icon me-2" />
                        Définir le modèle "{title}"
                      </Button>
                    </Link>
                  </Card.Text>
                </Card>
              )}

            </Col>
          );
        }) : (
          <Col className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </Col>
        )) : (
        <ErrorMessage error={error} />
      )}
    </Row>
  );
}