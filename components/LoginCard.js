import { signIn } from 'next-auth/react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { providersData } from '../lib/client';
import { EMAIL_CONTACT } from '../lib/common';

export function LoginCard({ providers }) {
  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={8} md={6} lg={5} xl={4}>
        <Card>
          <Card.Body>
            <Card.Title className="mb-3 text-center">Connexion</Card.Title>
            <Card.Text>
              Merci d'utiliser l'un des services ci-dessous pour vous inscrire ou vous connecter.
            </Card.Text>
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
            <Card.Text className="mt-3">
              En cas de problème, <a href={`mailto:${EMAIL_CONTACT}`}>merci de nous contacter</a>.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
