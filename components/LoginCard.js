import { signIn } from 'next-auth/react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { BsFacebook, BsGoogle } from 'react-icons/bs';
import { providersData } from './providers';

export function LoginCard({ providers }) {
  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={8} md={6} lg={5} xl={4}>
        <Card>
          <Card.Body>
            <Card.Title className="mb-3 text-center">Connexion</Card.Title>
            <Card.Text>Utilisez l'un des services ci-dessous pour vous connecter.</Card.Text>
            {Object.values(providers).map((provider) => {
              const format = providersData[provider.id];
              const Icon = format.icon;
              return (
                <div key={provider.name} className="mt-2">
                  <Button variant={format.variant} size="lg" onClick={() => signIn(provider.id, { callbackUrl: `${window.location.origin}/redirection` })} className="w-100">
                    <Icon className="icon me-2" />
                    Se connecter avec <strong>{provider.name}</strong>
                  </Button>
                </div>
              );
            })}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}