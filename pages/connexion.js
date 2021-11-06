import { getProviders, signIn } from 'next-auth/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from 'react-bootstrap';
import { BsGoogle } from 'react-icons/bs';

export default function Connexion({ providers }) {

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
                  {Object.values(providers).map((provider) => (
                    <div key={provider.name}>
                      <Button variant="secondary" size="lg" onClick={() => signIn(provider.id, { callbackUrl: `${window.location.origin}/administration` })} className="w-100">
                        {provider.id === 'google' && <BsGoogle className="icon me-2" />}
                        Se connecter avec <strong>{provider.name}</strong>
                      </Button>
                    </div>
                  ))}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>


    </div>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  }
}
