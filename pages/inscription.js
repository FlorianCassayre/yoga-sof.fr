/* eslint-disable */

import { isSameDay } from 'date-fns';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, ProgressBar, Row, Spinner, Table } from 'react-bootstrap';
import { BsArrowLeft, BsCheckLg, BsInfoCircleFill } from 'react-icons/bs';
import Link from 'next/link';
import { registerLocale } from 'react-datepicker';
import { Form as FinalForm, Field } from 'react-final-form';

import { fr } from 'date-fns/locale';
import { PublicLayout } from '../components/layout/public';
import { AuthGuard, ErrorMessage } from '../components';
import { StaticPaginatedTable } from '../components/table';
import { displayDateOnly,
  EMAIL_CONTACT,
  formatTime,
  formatTimeRange,
  IS_REGISTRATION_DISABLED,
  minutesToParsedTime,
  parsedTimeToMinutes,
  parsedTimeToTime,
  parseTime,
  SESSIONS_NAMES,
  USER_TYPE_ADMIN,
  USER_TYPE_REGULAR,
  WEEKDAYS,
  YOGA_ADULT,
  YOGA_ADULT_CHILD,
  YOGA_CHILD } from '../lib/common';
import { usePromiseCallback, usePromiseEffect } from '../hooks';
import { getSessionsSchedule, postSelfRegistrationBatch } from '../lib/client/api';

registerLocale('fr', fr);

export default function Inscription() {
  const { data: sessionData } = useSession();

  const { isLoading, isError, data, error } = usePromiseEffect(getSessionsSchedule, []); // eslint-disable-line no-unused-vars

  const [submitData, setSubmitData] = useState({});

  const [{ isLoading: isSubmitting, isError: isSubmitError, data: submitResult, error: submitError }, submitDispatch] = usePromiseCallback(data => postSelfRegistrationBatch(data), []);

  function CourseOption({ type, title, person, onSelect }) {
    const matchedSessions = data.schedule.filter(({ type: otherType }) => otherType === type);
    const matchedRegistrable = data.sessions.filter(({ type: otherType }) => otherType === type);

    const existsAvailableSlot = matchedRegistrable.filter(({ slots, registrations }) => registrations < slots).length > 0;

    const renderPrices = () => {
      const distinctPrices = Array.from(new Set(matchedSessions.map(({ price }) => price))).sort((a, b) => a - b);
      return distinctPrices.length === 1 ? `${distinctPrices[0]} €` : `${distinctPrices[0]} à ${distinctPrices[distinctPrices.length - 1]} €`;
    };

    const renderDuration = () => {
      const distinctDurations = Array.from(
        new Set(matchedSessions.map(({ time_start: timeStart, time_end: timeEnd }) => parsedTimeToMinutes(parseTime(timeEnd)) - parsedTimeToMinutes(parseTime(timeStart)))),
      )
        .sort((a, b) => a - b)
        .map(minutes => formatTime(parsedTimeToTime(minutesToParsedTime(minutes)), true));
      return distinctDurations.length === 1 ? distinctDurations[0] : `${distinctDurations[0]} à ${distinctDurations[distinctDurations.length - 1]}`;
    };

    const renderDatesAndTimes = () => {
      if (matchedSessions.length > 0) {
        const sortedDistinctWeekdays = Array.from(new Set(matchedSessions.map(({ weekday }) => weekday))).sort((a, b) => a - b);

        return (
          <>
            Tous
            {' '}
            {sortedDistinctWeekdays.map(weekday => {
              const sessionsForWeekday = matchedSessions
                .filter(({ weekday: weekdayOther }) => weekdayOther === weekday)
                .sort(({ time_start: t1 }, { time_end: t2 }) => parsedTimeToMinutes(parseTime(t1)) - parsedTimeToMinutes(parseTime(t2)));

              return (
                <React.Fragment key={weekday}>
                  les
                  {' '}
                  {`${WEEKDAYS[weekday].toLowerCase()}s`}
                  {' '}
                  {sessionsForWeekday.map(({ id, time_start: timeStart, time_end: timeEnd }, i) => (
                    <React.Fragment key={id}>
                      {'de '}
                      {formatTime(timeStart, true)}
                      {' '}
                      à
                      {formatTime(timeEnd, true)}
                      {i < sessionsForWeekday.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </>
        );
      }
      return <em>Pas d'horaires disponibles</em>;
    };

    return (
      <Col xs={12} md={4}>
        <Card
          className={`text-center my-2 ${existsAvailableSlot ? 'card-highlight' : 'opacity-50'}`}
          style={{ cursor: existsAvailableSlot ? 'pointer' : null }}
          onClick={() => existsAvailableSlot && onSelect(type)}
        >
          <Card.Img variant="top" src="/stock/woman_stretch_cropped.jpg" />
          <Card.Body>
            <Card.Title>{title}</Card.Title>
            <Card.Text>
              {matchedSessions.length > 0 ? (
                <>
                  {renderPrices()}
                  {' '}
                  par
                  {person}
                  {' '}
                  pour
                  {renderDuration()}
                  {' '}
                  de pratique
                </>
              ) : (
                <em>Pas d'informations disponibles</em>
              )}
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted">{renderDatesAndTimes()}</small>
          </Card.Footer>
        </Card>
      </Col>
    );
  }

  function Step1({ setValue }) {
    const handleSelect = type => {
      setValue('type', type);
      setValue('sessions', []);
      setValue('step', 2);
    };
    return (
      <Row>
        <CourseOption type={YOGA_ADULT} title="Séance de Yoga adulte" person="adulte" onSelect={handleSelect} />
        <CourseOption type={YOGA_CHILD} title="Séance de Yoga enfant" person="enfant" onSelect={handleSelect} />
        <CourseOption type={YOGA_ADULT_CHILD} title="Séance de Yoga parent-enfant" person="duo" onSelect={handleSelect} />
      </Row>
    );
  }

  function Step2({ setValue, values }) {
    const sessionsForType = data.sessions.filter(({ type: typeOther }) => typeOther === values.type);
    // TODO remove already registered sessions
    const selectableDates = sessionsForType.map(({ date_start: date }) => new Date(date));
    // const times = selectableDates.map(d => d.getTime());
    // const now = new Date();
    // const [minDate, maxDate] = selectableDates.length > 0 ? [new Date(Math.min(...times)), new Date(Math.max(...times))] : [now, now];

    // const isDateSelectable = date => selectableDates.some(other => isSameDay(date, other));
    /* const handleDayClick = currentValue => date => {
      const matchingSessions = sessionsForType.filter(({ date_start: sessionDate }) => isSameDay(new Date(sessionDate), date));
      if (matchingSessions.length > 0) {
        if (matchingSessions.length === 1) {
          const session = matchingSessions[0];
          setValue('sessions', currentValue.includes(session.id) ? currentValue.filter(id => id !== session.id) : [...currentValue, session.id]);
        } else {
          // Ambiguous
          console.log('TODO'); // TODO
        }
      }
      // Otherwise, do nothing
    }; */
    const handleSessionClick = currentValue => id => {
      setValue('sessions', currentValue.includes(id) ? currentValue.filter(otherId => id !== otherId) : [...currentValue, id]);
    };

    return (
      <div className="text-center date-picker-registration">
        {/* <Field
          name="sessions"
        >
          {({ input: { value } }) => (
            <DatePicker
              locale="fr"
              selected={minDate}
              highlightDates={sessionsForType.filter(({ id }) => value.includes(id)).map(({ date_start: date }) => new Date(date))}
              filterDate={isDateSelectable}
              onSelect={handleDayClick(value)}
              minDate={minDate}
              maxDate={maxDate}
              placeholderText="Sélectionnez des dates"
              inline
            />
          )}
        </Field> */}

        <Field name="sessions">
          {({ input: { value } }) => (
            <>
              <div className="mb-2">Cochez les séances pour lesquelles vous souhaitez vous inscrire :</div>
              <StaticPaginatedTable
                rows={sessionsForType}
                columns={[
                  {
                    title: 'Type de séance',
                    render: () => SESSIONS_NAMES[values.type],
                  },
                  {
                    title: 'Date',
                    render: ({ date_start: date }) => displayDateOnly(date),
                  },
                  {
                    title: 'Période',
                    render: ({ date_start: dateStart, date_end: dateEnd }) => formatTimeRange(dateStart, dateEnd),
                  },
                  {
                    title: 'Inscription',
                    render: ({ id }) => <Form.Check type="checkbox" id={`check-${id}`} checked={value.includes(id)} onChange={() => handleSessionClick(value)(id)} />,
                  },
                ]}
                renderEmpty="Aucune séance disponible."
                initialResultsPerPage={25}
                rowProps={({ id }) => ({ onClick: () => handleSessionClick(value)(id) })}
              />
            </>
          )}
        </Field>

        <Button variant="primary" className="mt-3" onClick={() => setValue('step', 3)} disabled={!values.sessions.length}>
          <BsCheckLg className="icon me-2" />
          Valider ces séances et continuer
        </Button>
      </div>
    );
  }

  function Step3({ values }) {
    return (
      <>
        <Row>
          <Col>
            <h4>Récapitulatif de vos inscriptions</h4>

            <Table bordered>
              <thead>
                <tr>
                  <th>Séance</th>
                  <th>Date</th>
                  <th>Heures</th>
                </tr>
              </thead>
              <tbody>
                {values.sessions.map((id, i) => (
                  <tr key={id}>
                    {i === 0 && (
                      <td rowSpan={values.sessions.length} className="align-middle text-center">
                        {SESSIONS_NAMES[values.type]}
                      </td>
                    )}
                    <td>{displayDateOnly(data.sessions.filter(({ id: idOther }) => idOther === id)[0].date_start)}</td>
                    <td>{data.sessions.filter(({ id: idOther }) => idOther === id).map(({ date_start: dateStart, date_end: dateEnd }) => formatTimeRange(new Date(dateStart), new Date(dateEnd)))[0]}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="text-center">
              <Badge bg="secondary">{values.sessions.length}</Badge>
              {' '}
              {values.sessions.length > 1 ? 'séances' : 'séance'}
              {' '}
              au total.
            </div>
          </Col>
          <Col>
            <h4>Vos informations</h4>
            <Table bordered>
              <tbody>
                <tr>
                  <th>Nom</th>
                  <td>{sessionData.user.name}</td>
                </tr>
                <tr>
                  <th>Adresse e-mail</th>
                  <td>{sessionData.user.email}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-3">
            <Button type="submit">
              <BsCheckLg className="icon me-2" />
              Confirmer mes inscriptions
            </Button>
          </Col>
        </Row>

        <div className="text-center">
          <em>Vous avez la possibilité de reporter votre/vos séance(s). Merci de nous le faire savoir au moins une semaine à l'avance en nous écrivant par e-mail.</em>
        </div>
      </>
    );
  }

  const steps = [1, 2, 3];

  const onSubmit = values => {
    // console.log(values);

    const data = { sessions: values.sessions };

    setSubmitData(values);

    submitDispatch(data);
  };

  return (
    <AuthGuard allowedUserTypes={[USER_TYPE_REGULAR, USER_TYPE_ADMIN]}>
      <PublicLayout padNavbar title="Inscription">
        <Container className="py-5">
          <h2 className="display-6">Inscription à une ou plusieurs séance(s) de Yoga adulte</h2>
          <ul>
            <li>
              Les inscriptions aux séances de Yoga adulte se font via le formulaire ci-dessous
              <ul>
                <li>En ce qui concerne les séances de Yoga enfant et Yoga parent-enfant, veuillez nous envoyer un email</li>
              </ul>
            </li>
            <li>La première séance vous est offerte, à la date de votre choix</li>
            {/* <li>La première séance est gratuite</li>
            <li>L'inscription à une séance est nécessaire pour y assister</li>
            <li>Les séances peuvent être choisies à l'unité</li>
            <li>Il est possible de reporter une séance déjà réservée, merci de nous écrire à l'avance par email</li> */}
          </ul>
          {!IS_REGISTRATION_DISABLED ? (
            <FinalForm
              onSubmit={onSubmit}
              initialValues={{
                step: 1,
                type: null,
                sessions: [],
                ...submitData, // Dirty fix
              }}
              mutators={{ setValue: ([field, value], state, { changeValue }) => changeValue(state, field, () => value) }}
              keepDirtyOnReinitialize
              render={({
                handleSubmit,
                form: { mutators: { setValue } },
                values,
              }) => (
                <Form onSubmit={handleSubmit}>
                  {!isLoading ? (
                    <div>
                      <Row className="text-center mt-4">
                        {steps.map(step => (
                          <Col key={step} style={{ position: 'relative' }}>
                            <h3 className="m-0">
                              <Badge pill bg={step <= values.step ? 'primary' : 'secondary'} style={{ border: 'solid white 5px' }} onClick={() => step === values.step - 1 && setValue('step', step)}>
                                {step}
                              </Badge>
                            </h3>
                            {step < 3 && (
                              <ProgressBar
                                now={step < values.step ? 100 : 0}
                                style={{ position: 'absolute', width: '100%', left: 0, top: '50%', transform: 'translate(50%, -50%)', zIndex: -10 }}
                              />
                            )}
                          </Col>
                        ))}
                      </Row>
                      <Row className="text-center mb-5">
                        {steps.map(step => (
                          <Col key={step}>
                            <span className="text-muted">{step === 1 ? <>Choix du type de séance</> : step === 2 ? <>Choix des horaires</> : <>Confirmation</>}</span>
                          </Col>
                        ))}
                      </Row>

                      {isSubmitting ? (
                        <div className="text-center my-4">
                          <Spinner animation="border" />
                        </div>
                      ) : submitResult ? (
                        <Alert variant="success">
                          Vos inscriptions ont été enregistrées avec succès. Vous pouvez les retrouver
                          {' '}
                          <Link href="/mes-inscriptions" passHref>
                            <Alert.Link>sur votre page personnelle</Alert.Link>
                          </Link>
                          .
                        </Alert>
                      ) : (
                        <>
                          {submitError && <ErrorMessage>Une erreur est survenue : impossible de vous inscrire aux séances sélectionnés.</ErrorMessage>}

                          {values.step > 1 && (
                            <Button variant="secondary" size="sm" onClick={() => !isSubmitting && !submitResult && setValue('step', values.step - 1)} className="mb-4">
                              <BsArrowLeft className="icon me-2" />
                              Étape précédente
                            </Button>
                          )}

                          {values.step === 1 ? <Step1 setValue={setValue} /> : values.step === 2 ? <Step2 setValue={setValue} values={values} /> : <Step3 values={values} />}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="m-5 text-center">
                      <Spinner animation="border" />
                    </div>
                  )}
                </Form>
              )}
            />
          ) : (
            <Alert variant="info">
              <BsInfoCircleFill className="icon me-2" />
              Le formulaire d'inscription n'est pas ouvert pour le moment. Vous pouvez
              {' '}
              <Alert.Link href={`mailto:${EMAIL_CONTACT}`}>nous écrire</Alert.Link>
              {' '}
              pour obtenir plus de renseignements.
            </Alert>
          )}
        </Container>
      </PublicLayout>
    </AuthGuard>
  );
}
