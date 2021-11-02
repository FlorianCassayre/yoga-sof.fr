import Head from 'next/head';
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';

export default function Connexion() {

  return (
    <div>
      <Head>
        <title>Connexion</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container className="my-5 px-3">
        <Row className="justify-content-center">
          <Col xs={12} sm={8} md={6} lg={5} xl={4}>
            <Card>
              <Card.Body>
                <Card.Title className="mb-3">Connexion à l'intranet</Card.Title>
                <Card.Text>
                  <FloatingLabel
                    controlId="floatingEmail"
                    label="Adresse e-mail"
                    className="mb-3"
                  >
                    <Form.Control type="email" placeholder="adresse@exemple.fr" />
                  </FloatingLabel>
                  <FloatingLabel controlId="floatingPassword" label="Mot de passe">
                    <Form.Control type="password" placeholder="Mot de passe" />
                  </FloatingLabel>
                  <Form.Check type="checkbox" label="Rester connecté" className="mt-3" />
                </Card.Text>
                <Button variant="primary" type="submit" className="w-100">Me connecter</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>


    </div>
  );
}
