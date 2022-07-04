import Link from 'next/link';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar, BsCollection, BsPencil, BsPlusLg } from 'react-icons/bs';
import { usePromiseEffect } from '../hooks';
import { getCourseModels } from '../lib/client/api';
import { COURSE_NAMES, WEEKDAYS, formatTime, parseTime, parsedTimeToMinutes } from '../lib/common';
import { ErrorMessage } from './ErrorMessage';

export function CourseCards({ readonly }) {
  const { isLoading, isError, data, error } = usePromiseEffect(getCourseModels, []);

  const compareModels = ({ weekday: d1, timeStart: t1 }, { weekday: d2, timeStart: t2 }) => {
    if (d1 !== d2) {
      return d1 - d2;
    }
    return parsedTimeToMinutes(parseTime(t1)) - parsedTimeToMinutes(parseTime(t2));
  };

  return (
    <Row>
      {!isError ? (
        !isLoading ? (
          <>
            {data.sort(compareModels).map(({ id, type, weekday, timeStart, timeEnd, slots, price, bundle }) => (
              <Col key={id} xs={12} lg={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>
                      <BsCalendar className="icon me-2" />
                      {COURSE_NAMES[type]}
                      {bundle && (
                        <Badge pill bg="secondary" className="ms-2">
                          <BsCollection className="icon me-2" />
                          Lot
                        </Badge>
                      )}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Le
                      {' '}
                      <strong>{WEEKDAYS[weekday].toLowerCase()}</strong>
                      {' '}
                      de
                      {' '}
                      <strong>
                        {formatTime(timeStart)}
                        {' '}
                        à
                        {' '}
                        {formatTime(timeEnd)}
                      </strong>
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      <strong>{slots}</strong>
                      {' '}
                      places
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      {price > 0 ? (
                        <>
                          <strong>
                            {price}
                            {' '}
                            €
                          </strong>
                          {' '}
                          par personne
                          {bundle ? ` pour le lot de cours` : ` et par cours`}
                        </>
                      ) : (
                        <strong>Gratuit</strong>
                      )}
                    </Card.Subtitle>
                    {/* <Card.Text>

                    </Card.Text> */}
                    {!readonly && (
                    <span className="d-block text-end">
                      <Link href={`/administration/seances/modeles/${id}/edition`} passHref>
                        <Button size="sm">
                          <BsPencil className="icon me-2" />
                          Modifier
                        </Button>
                      </Link>
                    </span>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}

            {(!readonly || data.length === 0) && (
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
            )}
          </>
        ) : (
          <Col className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </Col>
        )
      ) : (
        <ErrorMessage error={error} />
      )}
    </Row>
  );
}
