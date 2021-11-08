import { useState } from 'react';
import { Badge, Button, Card, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { BsCheck, BsCheck2 } from 'react-icons/bs';
import { PublicLayout } from '../components/layout/public';
import DatePicker, { registerLocale } from 'react-datepicker';

import { fr } from 'date-fns/locale';
registerLocale('fr', fr);

export default function Inscription({ pathname }) {
  const [currentStep, setCurrentStep] = useState(1);

  const CourseOption = ({ title, description, period }) => {
    return (
      <Card className="card-highlight text-center" style={{ cursor: 'pointer' }} onClick={() => setCurrentStep(2)}>
        <Card.Img variant="top" src="/stock/woman_stretch_cropped.jpg" />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            {description}
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            {period}
          </small>
        </Card.Footer>
      </Card>
    );
  }

  const Step1 = () => (
    <Row>
      <Col>
        <CourseOption
          title="Séance de yoga adulte"
          description="10€ par adulte pour 1h"
          period="Tous les mardis de 17h à 18h"
        />
      </Col>
      <Col>
        <CourseOption
          title="Séance de yoga enfant"
          description="15€ par enfant pour 2h"
          period="Tous les vendredis de 16h à 18h"
        />
      </Col>
      <Col>
        <CourseOption
          title="Séance de yoga parent-enfant"
          description="20€ par duo pour 1h"
          period="Tous les lundis de 19h à 20h"
        />
      </Col>
    </Row>
  );

  const Step2 = () => {
    const [startDate, setStartDate] = useState(null);
    const isWeekday = (date) => {
      return Math.random() < .5;
    };
    return (
      <div className="text-center">
        <DatePicker
          locale="fr"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          filterDate={isWeekday}
          placeholderText="Select a weekday"
          inline
        />

        <Button variant="primary" className="mt-3" onClick={() => setCurrentStep(3)}>
          <BsCheck2 className="icon me-2" />
          Valider ces horaires et continuer
        </Button>
      </div>
    );
  }

  const Step3 = () => (
    <>
      <Row>
        <Col>
          <h4>Récapitulatif de vos inscriptions</h4>
          <span><Badge bg="secondary">3</Badge> séances <strong>"yoga adulte"</strong> aux dates suivantes :</span>
          <ul>
            <li>01/01/2021 de 18h à 19h</li>
          </ul>
        </Col>
        <Col>
          <h4>Vos informations</h4>
        </Col>
      </Row>

      <div className="text-center">
        <em>
          Vous avez la possibilité de reporter votre/vos séance(s). Merci de nous le faire savoir au moins une semaine à l'avance en nous écrivant par e-mail.
        </em>
      </div>
    </>
  );

  const courses = [1, 2, 3];

  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container className="py-5">
        <h2 className="display-6">Inscription à une ou plusieurs séance(s) de yoga</h2>
        <ul>
          <li>La première séance est gratuite</li>
          <li>L'inscription à une séance est nécessaire pour y assister</li>
          <li>Les séances peuvent être choisies à l'unité</li>
          <li>Il est possible de reporter une séance déjà réservée, merci de nous écrire à l'avance par email</li>
        </ul>
        <Row className="text-center mt-4">
          {courses.map(step => (
            <Col key={step} style={{ position: 'relative' }}>
              <h3 className="m-0">
                <Badge pill bg={step <= currentStep ? 'primary' : 'secondary'} style={{ border: 'solid white 5px' }}>{step}</Badge>
              </h3>
              {step < 3 && (
                <ProgressBar now={step < currentStep ? 100 : 0} style={{ position: 'absolute', width: '100%', left: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: -10 }} />
              )}
            </Col>
          ))}
        </Row>
        <Row className="text-center mb-5">
          {courses.map(step => (
            <Col key={step}>
              <span className="text-muted">
                {step === 1 ? (
                  <>Choix de la séance</>
                ) : step === 2 ? (
                  <>Calendrier</>
                ) : (
                  <>Informations personnelles et règlement</>
                )}
              </span>
            </Col>
          ))}
        </Row>
        {currentStep === 1 ? (
          <Step1 />
        ) : currentStep === 2 ? (
          <Step2 />
        ) : (
          <Step3 />
        )}
      </Container>
    </PublicLayout>
  );
}

Inscription.getInitialProps = ({ pathname })  => {
  return { pathname };
}
