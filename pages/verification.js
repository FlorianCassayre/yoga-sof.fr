import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { HeadMeta } from '../components/layout/HeadMeta';

export default function Verification() {
  return (
    <div>
      <HeadMeta title="E-mail envoyé - Yoga Sof" />

      <Container className="my-5 px-3">
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <Card>
              <Card.Body>
                <Card.Title className="mb-3 text-center">E-mail envoyé</Card.Title>
                <Card.Text>Consultez votre boîte de réception, nous vous avons envoyé un lien pour vous connecter au site.</Card.Text>
                <Card.Text className="text-center">
                  <Link href="/" passHref>
                    <Button>Revenir à l'accueil</Button>
                  </Link>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
