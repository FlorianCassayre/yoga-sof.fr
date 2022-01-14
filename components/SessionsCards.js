import Link from 'next/link';
import { useMemo } from 'react';
import { Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar, BsPencil, BsPlusLg } from 'react-icons/bs';
import { useDataApi } from '../hooks';
import { formatTime, parsedTimeToMinutes, parseTime, WEEKDAYS } from './date';
import { ErrorMessage } from './ErrorMessage';
import { SESSIONS_TYPES } from './sessions';

export function SessionsCards() {
  const [{ isLoading, isError, data, error }] = useDataApi('/api/session_models');

  const compareModels = ({ weekday: d1, time_start: t1 }, { weekday: d2, time_start: t2 }) => {
    if(d1 !== d2) {
      return d1 - d2;
    } else {
      return parsedTimeToMinutes(parseTime(t1)) - parsedTimeToMinutes(parseTime(t2));
    }
  };

  return (
    <Row>
      {!isError ? (!isLoading ?
        (
          <>
            {data.sort(compareModels).map(({ id, type, weekday, time_start: timeStart, time_end: timeEnd, slots, price }) => (
              <Col key={id} xs={12} lg={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>
                      <BsCalendar className="icon me-2" />
                      {SESSIONS_TYPES.filter(({ id }) => type === id)[0].title}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Le <strong>{WEEKDAYS[weekday].toLowerCase()}</strong> de <strong>{formatTime(timeStart)} à {formatTime(timeEnd)}</strong>
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      <strong>{slots}</strong> places
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      {price > 0 ? (
                        <>
                          <strong>{price} €</strong> par personne
                        </>
                        ) : (
                        <strong>Gratuit</strong>
                        )}
                    </Card.Subtitle>
                    {/*<Card.Text>

                    </Card.Text>*/}
                    <span className="d-block text-end">
                      <Link href={`/administration/seances/modeles/${id}/edition`} passHref>
                        <Button size="sm">
                          <BsPencil className="icon me-2" />
                          Modifier
                        </Button>
                      </Link>
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            ))}

            <Col xs={12} lg={4} className="mb-4">
              <Card className="py-3 text-center">
                <Card.Text>
                      <span className="d-block h1 mb-3">
                        <BsCalendar className="icon" />
                      </span>
                  <Link href="/administration/seances/modeles/creation" passHref>
                    <Button variant="success">
                      <BsPlusLg className="icon me-2" />
                      Créer un nouveau modèle
                    </Button>
                  </Link>
                </Card.Text>
              </Card>
            </Col>
          </>
        ) : (
          <Col className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </Col>
        )) : (
        <ErrorMessage error={error} />
      )}
    </Row>
  );
}