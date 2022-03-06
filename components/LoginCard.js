import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Card, Col, FloatingLabel, Form, Row } from 'react-bootstrap';
import { providersData } from '../lib/client';
import { EMAIL_CONTACT } from '../lib/common';
import { ErrorMessage } from './ErrorMessage';

export function LoginCard({ providers }) {
  const router = useRouter();
  const { error } = router.query;

  const [emailValue, setEmailValue] = useState('');

  const errorMessages = {
    OAuthAccountNotLinked: 'Il semble que vous vous vous soyez déjà connecté depuis un autre service. Merci de réutiliser ce service pour vous connecter.',
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={8} md={6} lg={5} xl={4}>
        {!!error && (
          <ErrorMessage>
            Une erreur est survenue lors de la connexion.
            {' '}
            {errorMessages[error] ? errorMessages[error] : 'Si le problème persiste, merci de nous le faire savoir.'}
          </ErrorMessage>
        )}
        <Card>
          <Card.Body>
            <Card.Title className="mb-3 text-center">Connexion</Card.Title>
            <Card.Text>Merci d'utiliser l'un des services ci-dessous pour vous inscrire ou vous connecter.</Card.Text>
            {Object.values(providers).map(provider => {
              const isEmail = provider.id === 'email';
              const format = providersData[provider.id];
              const Icon = format.icon;
              const clickHandler = () => {
                const extraParams = isEmail ? { email: emailValue } : {};
                if (isEmail && !emailValue) {
                  return; // TODO validation
                }
                signIn(provider.id, { callbackUrl: `${window.location.origin}/redirection`, ...extraParams });
              };
              return (
                <div key={provider.id} className="mt-2">
                  {isEmail && (
                    <div className="hr-sect my-3">OU</div>
                  )}
                  {isEmail && (
                    <FloatingLabel
                      controlId="email"
                      label="Adresse e-mail"
                      className="mb-2"
                    >
                      <Form.Control type="email" name="identifier" placeholder="adresse@exemple.com" required value={emailValue} onChange={e => setEmailValue(e.target.value)} />
                    </FloatingLabel>
                  )}
                  <Button variant={format.variant} size="lg" onClick={clickHandler} className="w-100">
                    <Icon className="icon me-2" />
                    {!isEmail ? (
                      <>
                        Se connecter avec
                        {' '}
                        <strong>{provider.name}</strong>
                      </>
                    ) : (
                      <>
                        Recevoir un lien de connexion
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
            <Card.Text className="mt-3">
              En cas de problème,
              {' '}
              <a href={`mailto:${EMAIL_CONTACT}`}>n'hésitez pas à nous contacter</a>
              .
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
