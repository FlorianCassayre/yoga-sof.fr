import React, { useState } from 'react';
import { Badge, Button, Card, Col, Container, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { BsCheck2 } from 'react-icons/bs';
import {
  formatTime, minutesToParsedTime, parsedTimeToMinutes, parsedTimeToTime, parseTime,
  SESSIONS_TYPES,
  USER_TYPE_ADMIN,
  USER_TYPE_REGULAR,
  WEEKDAYS,
  YOGA_ADULT,
  YOGA_ADULT_CHILD,
  YOGA_CHILD,
} from '../components';
import { AuthGuard } from '../components';
import { PublicLayout } from '../components/layout/public';
import DatePicker, { registerLocale } from 'react-datepicker';

import { fr } from 'date-fns/locale';
import { useDataApi } from '../hooks';
registerLocale('fr', fr);

export default function Inscription({ pathname }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [{ isLoading, isError, data, error }] = useDataApi('/api/sessions_schedule');

  const CourseOption = ({ type, title, person, description }) => {
    const matchedSessions = data.schedule.filter(({ type: otherType }) => otherType === type);

    const renderPrices = () => {
      const distinctPrices = Array.from(new Set(matchedSessions.map(({ price }) => price))).sort((a, b) => a - b);
      return distinctPrices.length === 1 ? `${distinctPrices[0]} €` : `${distinctPrices[0]} à ${distinctPrices[distinctPrices.length - 1]} €`;
    };

    const renderDuration = () => {
      const distinctDurations = Array.from(new Set(matchedSessions.map(({ time_start: timeStart, time_end: timeEnd }) =>
        parsedTimeToMinutes(parseTime(timeEnd)) - parsedTimeToMinutes(parseTime(timeStart))
      ))).sort((a, b) => a - b).map(minutes => formatTime(parsedTimeToTime(minutesToParsedTime(minutes)), true));
      return distinctDurations.length === 1 ? distinctDurations[0] : `${distinctDurations[0]} à ${distinctDurations[distinctDurations.length - 1]}`;
    };

    const renderDatesAndTimes = () => {
      if(matchedSessions.length > 0) {
        const sortedDistinctWeekdays = Array.from(new Set(matchedSessions.map(({ weekday }) => weekday))).sort((a, b) => a - b);

        return (
          <>
            Tous{' '}
            {sortedDistinctWeekdays.map(weekday => {
              const sessionsForWeekday = matchedSessions
                .filter(({ weekday: weekdayOther }) => weekdayOther === weekday)
                .sort(({ time_start: t1 }, { time_end: t2 }) => parsedTimeToMinutes(parseTime(t1)) - parsedTimeToMinutes(parseTime(t2)));

              return (
                <React.Fragment key={weekday}>
                  les
                  {' '}
                  {WEEKDAYS[weekday].toLowerCase() + 's'}
                  {' '}
                  {sessionsForWeekday.map(({ id, time_start: timeStart, time_end: timeEnd }, i) => (
                    <React.Fragment key={id}>
                      {'de '}
                      {formatTime(timeStart, true)} à {formatTime(timeEnd, true)}
                      {i < sessionsForWeekday.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </>
        )
      } else {
        return (
          <em>Pas d'horaires disponibles</em>
        );
      }
    };

    return (
      <Card className="card-highlight text-center" style={{ cursor: 'pointer' }} onClick={() => setCurrentStep(2)}>
        <Card.Img variant="top" src="/stock/woman_stretch_cropped.jpg" />
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            {matchedSessions.length > 0 ? (
              <>
                {renderPrices()} par {person} pour {renderDuration()} de pratique
              </>
            ) : (
              <em>Pas d'informations disponibles</em>
            )}
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            {renderDatesAndTimes()}
          </small>
        </Card.Footer>
      </Card>
    );
  }

  const Step1 = () => (
    <Row>
      <Col>
        <CourseOption
          type={YOGA_ADULT}
          title="Séance de yoga adulte"
          person="adulte"
          description="10€ par adulte pour 1h"
        />
      </Col>
      <Col>
        <CourseOption
          type={YOGA_CHILD}
          title="Séance de yoga enfant"
          person="enfant"
          description="15€ par enfant pour 2h"
        />
      </Col>
      <Col>
        <CourseOption
          type={YOGA_ADULT_CHILD}
          title="Séance de yoga parent-enfant"
          person="duo"
          description="20€ par duo pour 1h"
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
    <AuthGuard allowedUserTypes={[USER_TYPE_REGULAR, USER_TYPE_ADMIN]}>
      <PublicLayout pathname={pathname} padNavbar>
        <Container className="py-5">
          <h2 className="display-6">Inscription à une ou plusieurs séance(s) de yoga</h2>
          <ul>
            <li>La première séance est gratuite</li>
            <li>L'inscription à une séance est nécessaire pour y assister</li>
            <li>Les séances peuvent être choisies à l'unité</li>
            <li>Il est possible de reporter une séance déjà réservée, merci de nous écrire à l'avance par email</li>
          </ul>
          {!isLoading ? (
            <div>
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
                  <>Confirmation</>
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
            </div>
          ) : (
            <div className="m-5 text-center">
              <Spinner animation="border" />
            </div>
          )}

        </Container>
      </PublicLayout>
    </AuthGuard>
  );
}

Inscription.getInitialProps = ({ pathname })  => {
  return { pathname };
}
