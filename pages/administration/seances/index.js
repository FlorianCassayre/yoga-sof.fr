import { Card, Col, Row } from 'react-bootstrap';
import { BREADCRUMB_SESSIONS, SESSIONS_TYPES } from '../../../components';
import { PrivateLayout } from '../../../components/layout/admin';

export default function AdminSeances({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} breadcrumb={BREADCRUMB_SESSIONS}>
      <h1 className="h4">
        Séances
      </h1>

      <hr />

      <p>
        Ci-dessous, les modèles de séances par défaut.
        Il s'agit des horaires normales de déroulement des séances.
      </p>

      <Row>
        {SESSIONS_TYPES.map(({ id, title }) => (
          <Col key={id}>
            <Card>
              <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
                <Card.Text>
                  Some quick example text to build on the card title and make up the bulk of
                  the card's content.
                </Card.Text>
                <Card.Link href="#">Card Link</Card.Link>
                <Card.Link href="#">Another Link</Card.Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </PrivateLayout>
  );
}

AdminSeances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
