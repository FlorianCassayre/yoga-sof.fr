import Link from 'next/link';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { BsBoxArrowUpRight, BsDot, BsFillInfoCircleFill } from 'react-icons/bs';

function HomeSpecificationsItem({ icon: Icon, title, children }) {
  return (
    <Col xs={12} md={4} className="my-4 px-4">
      <h3>
        <Icon className="icon me-2" />
        {title}
      </h3>
      <div className="mb-2">
        <BsDot className="icon" />
      </div>
      {children}
    </Col>
  );
}

function HomeSpecifications({ children }) {
  return (
    <div className="py-5 course-card" style={{ backgroundColor: '#f7f7f7' }}>
      <Container>
        <Row className="text-center">
          {children}
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Alert variant="primary" className="shadow">
              <BsFillInfoCircleFill className="icon me-2" />
              La première séance vous est offerte.
              {' '}
              <Link href="/inscription" passHref>
                <Alert.Link>
                  Je m'inscris maintenant
                  <BsBoxArrowUpRight className="icon ms-2" />
                </Alert.Link>
              </Link>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

HomeSpecifications.Item = HomeSpecificationsItem;

export { HomeSpecifications };
