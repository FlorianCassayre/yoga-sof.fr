import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { BsArrowLeft, BsArrowRight, BsCheckLg, BsInfoCircleFill } from 'react-icons/bs';
import Link from 'next/link';
import { Form as FinalForm } from 'react-final-form';

import { ErrorMessage } from './ErrorMessage';
import { StaticPaginatedTable } from './table';
import {
  COURSE_NAMES,
  COURSE_TYPES,
  EMAIL_CONTACT,
  IS_REGISTRATION_DISABLED,
  WEEKDAYS,
  dateToParsedTime,
  formatDayRange,
  formatTime,
  parsedTimeToMinutes,
  parsedTimeToTime,
} from '../lib/common';
import { usePromiseCallback, usePromiseEffect } from '../hooks';
import { getCoursesSchedule, getSelfRegistrations, postSelfRegistrationBatch } from '../lib/client/api';
import { useNotificationsContext, useRefreshContext } from '../state';
import {
  RegistrationNoticePersonalInformations,
  RegistrationNoticeRecap,
} from '../contents/inscription.mdx';

function RegistrationFormLayout({ sessionData, scheduleData, selfRegistrations }) {
  const [{ isLoading: isSubmitting, isError: isSubmitError, data: submitResult }, submitDispatch] = usePromiseCallback(data => postSelfRegistrationBatch(data), []);
  const { notify } = useNotificationsContext();
  const refresh = useRefreshContext();

  const onSubmit = useCallback(data => {
    const { isStateConfirm, ...dataToSubmit } = data;

    submitDispatch(dataToSubmit);
  }, [submitDispatch]);

  useEffect(() => {
    if (submitResult) {
      notify({
        title: 'Inscriptions confirmées',
        body: 'Vos inscriptions ont été prises en compte.',
        icon: BsCheckLg,
        delay: 10,
      });
    }
  }, [submitResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const isUserAlreadyRegisteredToCourse = id => selfRegistrations.some(({ course: { id: courseId }, isUserCanceled }) => courseId === id && !isUserCanceled);

  const renderForm = ({ handleSubmit, values, form: { mutators: { setValue } } }) => {
    const handleCourseSelect = id => {
      if (isUserAlreadyRegisteredToCourse(id)) {
        return;
      }
      const course = scheduleData.courses.filter(({ id: thatId }) => thatId === id)[0];
      if (course.registrations >= course.slots) {
        return;
      }
      const isSelected = values.courses.includes(id);
      const newCourses = isSelected ? values.courses.filter(courseId => courseId !== id) : values.courses.concat([id]);
      setValue('courses', newCourses);
    };

    const groupCourses = coursesIds => {
      const set = new Set(coursesIds);
      const byType = {};
      scheduleData.courses.forEach(course => {
        if (set.has(course.id)) {
          if (!byType[course.type]) {
            byType[course.type] = [];
          }
          byType[course.type].push(course);
        }
      });
      return Object.entries(byType).sort(([a], [b]) => a.localeCompare(b)).map(([key, courses]) => [key, courses.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())]);
    };

    const dateToWeekday = date => (new Date(date).getDay() + 6) % WEEKDAYS.length;

    const slotsWarningThreshold = 1;

    return !isSubmitting ? (
      <Form onSubmit={handleSubmit}>
        {!values.isStateConfirm ? (
          <>
            <p className="mb-0">
              Sélectionnez les séances pour lesquelles vous souhaitez vous inscrire :
            </p>

            <StaticPaginatedTable
              rows={scheduleData.courses}
              filters={[
                {
                  title: 'Type de cours',
                  children:
                COURSE_TYPES
                  .filter(({ id }) => scheduleData.courses.filter(({ type }) => type === id).length > 0)
                  .map(({ id, title }) => ({
                    name: id,
                    display: title,
                    initial: true,
                  })),
                },
                {
                  title: 'Jour',
                  children:
                WEEKDAYS
                  .map((title, id) => ({ title, id }))
                  .filter(({ id }) => scheduleData.courses.filter(({ dateStart }) => dateToWeekday(dateStart) === id).length > 0)
                  .map(({ title, id }) => ({
                    name: id,
                    display: title,
                    initial: true,
                  })),
                },
                {
                  title: 'Horaire',
                  children: Object.entries(Object.fromEntries(
                    scheduleData.courses.map(({ dateStart, dateEnd }) => {
                      const timeStart = dateToParsedTime(dateStart), timeEnd = dateToParsedTime(dateEnd);
                      return [`${parsedTimeToMinutes(timeStart)}-${parsedTimeToMinutes(timeEnd)}`, [timeStart, timeEnd]];
                    }),
                  ))
                    .sort(([, [a]], [, [b]]) => parsedTimeToMinutes(a) - parsedTimeToMinutes(b))
                    .map(([id, [timeStart, timeEnd]]) => ({
                      name: id,
                      value: [timeStart, timeEnd],
                      display: `${formatTime(parsedTimeToTime(timeStart))} à ${formatTime(parsedTimeToTime(timeEnd))}`,
                      initial: true,
                    })),
                },
              ]}
              filter={({ dateStart, dateEnd, type }, filtersValues) => filtersValues[dateToWeekday(dateStart)] !== false
                && filtersValues[type] !== false
                && filtersValues[`${parsedTimeToMinutes(dateToParsedTime(dateStart))}-${parsedTimeToMinutes(dateToParsedTime(dateEnd))}`] !== false}
              columns={[
                {
                  title: 'Type de séance',
                  render: ({ type }) => COURSE_NAMES[type],
                  props: {
                    className: 'text-center',
                  },
                },
                {
                  title: 'Date et horaire',
                  render: ({ dateStart, dateEnd }) => (
                    <>
                      {formatDayRange(dateStart, dateEnd)}
                    </>
                  ),
                  props: {
                    className: 'text-center',
                  },
                },
                {
                  title: 'Places restantes / disponibles',
                  render: ({ slots, registrations }) => (
                    <>
                      <span className={
                        registrations >= slots
                          ? 'text-danger'
                          : slots > slotsWarningThreshold && slots - registrations === slotsWarningThreshold
                            ? 'text-warning' : 'text-success'
                      }
                      >
                        {slots - registrations}
                      </span>
                      {' '}
                      /
                      {' '}
                      {slots}
                    </>
                  ),
                  props: {
                    className: 'text-center',
                  },
                },
                {
                  title: 'Inscription ?',
                  render: ({ id, slots, registrations }) => (
                    <Form.Check
                      type="checkbox"
                      id={`check-${id}`}
                      disabled={registrations >= slots || isUserAlreadyRegisteredToCourse(id)}
                      checked={isUserAlreadyRegisteredToCourse(id) ? true : values.courses.includes(id)}
                      onClick={() => handleCourseSelect(id)}
                      onChange={() => null}
                    />
                  ),
                  props: {
                    className: 'text-center justify-content-center',
                  },
                },
              ]}
              rowProps={({ id }) => ({
                onClick: () => handleCourseSelect(id),
                style: {
                  opacity: isUserAlreadyRegisteredToCourse(id) ? 0.2 : null,
                  cursor: isUserAlreadyRegisteredToCourse(id) ? null : 'pointer',
                },
                className: values.courses.includes(id) ? 'table-success' : null,
              })}
              striped={false}
            />

            <div className="text-center mb-2">
              <small>
                <strong>{values.courses.length}</strong>
                {' '}
                séance
                {values.courses.length > 1 ? 's' : ''}
                {' '}
                sélectionnée
                {values.courses.length > 1 ? 's' : ''}
              </small>
            </div>

            {selfRegistrations.length > 0 && (
              <p className="text-center">
                Les séances grisées correspondent à celles pour lesquelles vous êtes déjà inscrit(e).
              </p>
            )}

            <div className="text-center">
              <Button size="lg" className="shadow" onClick={() => setValue('isStateConfirm', true)} disabled={values.courses.length === 0}>
                Étape suivante
                <BsArrowRight className="icon ms-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {isSubmitError && (
              <ErrorMessage>
                Une erreur est survenue lors de votre inscription aux séances sélectionnées, veuillez réessayer.
              </ErrorMessage>
            )}

            {submitResult && (
              <Alert variant="success">
                <BsCheckLg className="icon me-2" />
                Vos inscriptions ont bien été prises en compte, vous pouvez les retrouver sur
                {' '}
                <Link href="/mes-inscriptions" passHref><Alert.Link>votre page personnelle</Alert.Link></Link>
                .
                Si vous souhaitez vous inscrire à d'autres séances,
                {' '}
                <Alert.Link
                  href="/inscription"
                  onClick={e => {
                    e.preventDefault();
                    refresh();
                  }}
                >
                  cliquez ici
                </Alert.Link>
                .
                {' '}
                À bientôt !
              </Alert>
            )}

            <Row xs={1} xl={2}>
              <Col>
                <h2 className="h4">Récapitulatif de vos inscriptions</h2>

                <Table bordered>
                  <thead>
                    <tr className="text-center">
                      <th>Type de séance</th>
                      <th>Date et horaire</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupCourses(values.courses).map(([courseType, courses]) => courses.map((course, j) => (
                      <tr key={`${courseType}-${j}`}>
                        {j === 0 && (
                        <td rowSpan={courses.length} className="align-middle text-center">
                          {COURSE_NAMES[courseType]}
                        </td>
                        )}
                        <td>
                          {formatDayRange(course.dateStart, course.dateEnd)}
                        </td>
                        <td className="text-center">
                          {`${course.price} €`}
                        </td>
                      </tr>
                    )))}
                    <tr style={{ borderTop: 'solid black 2px' }} className="table-secondary">
                      <td colSpan={2} className="text-center">
                        <strong>{values.courses.length}</strong>
                        {' '}
                        séance
                        {values.courses.length > 1 ? 's' : ''}
                        {' '}
                        au total
                      </td>
                      <td className="text-center">
                        <strong>
                          {values.courses.map(id => scheduleData.courses.filter(({ id: idOther }) => idOther === id)[0].price).reduce((a, b) => a + b)}
                          {' '}
                          €
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <p>
                  <RegistrationNoticeRecap />
                </p>
              </Col>
              <Col>
                <h4>Vos informations</h4>
                <Table bordered>
                  <tbody>
                    <tr>
                      <th>Nom</th>
                      <td>{sessionData.displayName}</td>
                    </tr>
                    <tr>
                      <th>Adresse e-mail</th>
                      <td>{sessionData.displayEmail}</td>
                    </tr>
                  </tbody>
                </Table>
                <p>
                  <RegistrationNoticePersonalInformations />
                </p>
              </Col>
            </Row>

            {!submitResult && (
              <div className="text-center">
                <Button size="lg" variant="secondary" className="m-2" onClick={() => setValue('isStateConfirm', false)}>
                  <BsArrowLeft className="icon me-2" />
                  Retour
                </Button>
                <Button type="submit" size="lg" className="m-2 shadow" onClick={() => setValue('isStateConfirm', true)}>
                  <BsCheckLg className="icon me-2" />
                  Valider ces inscriptions
                </Button>
              </div>
            )}
          </>
        )}
      </Form>
    ) : (
      <div className="text-center my-2">
        <Spinner animation="border" />
      </div>
    );
  };

  return (
    <FinalForm
      onSubmit={onSubmit}
      initialValuesEqual={() => true} // Important: this prevents remounting
      initialValues={{
        courses: [],
        isStateConfirm: false,
      }}
      mutators={{ setValue: ([field, value], state, { changeValue }) => changeValue(state, field, () => value) }}
      render={renderForm}
    />
  );
}

function RegistrationCard({ sessionData }) {
  const { isLoading, isError, data } = usePromiseEffect(() => Promise.all([getCoursesSchedule(), getSelfRegistrations()]), []);

  return (
    <Card style={{ marginLeft: '-1rem', marginRight: '-1rem' }}>
      <Card.Body>
        {!isLoading ? (
          !isError ? (
            data[0].courses.length > 0 ? (
              <RegistrationFormLayout sessionData={sessionData} scheduleData={data[0]} selfRegistrations={data[1]} />
            ) : (
              <Alert variant="info" className="mb-0">
                <BsInfoCircleFill className="icon me-2" />
                Il n'y a pas de séance disponible à venir. Les séances sont planifiées au fur et à mesure, mais vous pouvez toujours nous envoyer un e-mail pour nous indiquer vos disponibilités.
              </Alert>
            )
          ) : (
            <ErrorMessage noMargin>
              Une erreur est survenue lors du chargement des horaires, essayez de recharger la page.
            </ErrorMessage>
          )
        ) : (
          <div className="text-center my-2">
            <Spinner animation="border" />
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export function RegistrationPanel() {
  const { data: sessionData, status } = useSession();
  const isSessionLoading = useMemo(() => status === 'loading', [status]);

  return !IS_REGISTRATION_DISABLED ? (
    !isSessionLoading ? (
      sessionData ? (
        <RegistrationCard sessionData={sessionData} />
      ) : (
        <Alert variant="info">
          <BsInfoCircleFill className="icon me-2" />
          Vous devez être connecté pour accéder au formulaire d'inscription.
          {' '}
          <Link href="/ConnexionPage" passHref>
            <Alert.Link>M'inscrire ou me connecter</Alert.Link>
          </Link>
        </Alert>
      )
    ) : (
      <div className="text-center my-3">
        <Spinner animation="border" />
      </div>
    )
  ) : (
    <Alert variant="info">
      <BsInfoCircleFill className="icon me-2" />
      Le formulaire d'inscription n'est pas ouvert pour le moment. Vous pouvez
      {' '}
      <Alert.Link href={`mailto:${EMAIL_CONTACT}`}>nous écrire</Alert.Link>
      {' '}
      pour obtenir plus de renseignements.
    </Alert>
  );
}
