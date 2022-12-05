import { displayCourseName, displayUserName } from '../lib/common/display';
import { Course, CourseRegistration, EmailMessageType } from '@prisma/client';
import { urlForLocation } from '../lib/common/urls';
import { LocationHome } from '../lib/common/config';
import React from 'react';
import { EmailMessageTemplate, EmailMessageWithContentTemplate } from '../lib/common/emailMessages';

const withContent = <Props extends {},>
(template: EmailMessageTemplate<Props>): EmailMessageWithContentTemplate<Props> => {
  const emailTemplatePartSubjectSuffix = '- Yoga Sof';
  const emailSubject = (subject: string) => `${subject} ${emailTemplatePartSubjectSuffix}`;
  return {
    type: template.type,
    subject: (props) => emailSubject(template.subject(props)),
    body: (props) => (
      <>
        {displayUserName(props.user)}
        ,
        <br />
        <br />
        {template.body(props)}
        {props.casual ? 'Namasté,' : 'Cordialement,'}
        <br />
        Sophie.
        <br />
        <br />
        --
        <br />
        <a href={process.env.NEXTAUTH_URL}>yoga-sof.fr</a>
        <br />
        Vous pouvez consulter ou annuler vos inscriptions en suivant
        {' '}
        <a href={`${process.env.NEXTAUTH_URL}/mes-inscriptions`}>ce lien</a>
        .
      </>
    ),
  };
};

export const EmailMessageTemplateCourseCanceled: EmailMessageWithContentTemplate<{ course: Parameters<typeof displayCourseName>[0] & Pick<Course, 'cancelationReason'> }> = withContent({
  type: EmailMessageType.SESSION_CANCELED,
  subject: () => `Notification d'annulation de séance`,
  body: ({ course }) => (
    <>
      La
      {' '}
      {displayCourseName(course, false)}
      {' '}
      a malheureusement été annulée.
      <br />
      {!!course.cancelationReason && (
        <>
          {course.cancelationReason}
          <br />
        </>
      )}
      <br />
      <br />
      Merci de votre compréhension.
      <br />
      <br />
    </>
  ),
});

export const EmailMessageTemplateCourseAdultReminderNewcomer: EmailMessageWithContentTemplate<{ course: Parameters<typeof displayCourseName>[0] }> = withContent({
  type: EmailMessageType.SESSION_REMINDER_NEWCOMER,
  subject: ({ course }) => `Votre ${displayCourseName(course, false)}`,
  body: ({ course }) => (
    <>
      J'ai le plaisir de vous rappeler votre inscription à la
      {' '}
      {displayCourseName(course, false)}
      ,
      {' '}
      je vous attends au
      {' '}
      <a href={urlForLocation(LocationHome)} target="_blank" rel="noopener noreferrer">8 rue des Moissonneurs</a>
      .
      <br />
      <br />
      Essayez d'être ponctuel(le) en arrivant 5 minutes avant pour vous installer.
      <br />
      <br />
      Apportez simplement votre tapis et couverture (ou drap s'il fait chaud), portez une tenue confortable, mais vous pouvez également vous changer et utiliser les toilettes sur place.
      <br />
      <br />
      Vous trouverez dans la salle ce qu'il faut pour adapter votre posture et pratiquer sereinement.
      <br />
      <br />
      S'il y a des informations que vous jugez importantes à me transmettre concernant votre santé, vos inquiétudes ou vos souhaits,
      {' '}
      vous pouvez le faire par retour de ce mail, ou bien en début de séance. Dans tous les cas, c'est votre ressenti qui prime
      {' '}
      et vous pourrez défaire la posture dès que vous sentez le moment, ou bien me demander en temps réel une adaptation de la posture si je ne l'ai pas anticipé.
      {' '}
      Cette séance de Yoga est un moment pour vous, profitez-en complètement !
      <br />
      <br />
      Informations pratiques concernant le stationnement :
      <ul>
        <li>Vous pouvez stationner votre vélo sur le côté gauche du jardin, près du conteneur vert.</li>
        <li>
          Pour les véhicules, privilégiez le parking du cimetière, juste à l'entrée de la rue des Moissonneurs pour ne pas déranger les voisins,
          {' '}
          l'impasse est petite, il n'y a qu'une place devant la maison.
        </li>
      </ul>
      <br />
      Je vous souhaite une belle pratique !
      <br />
      <br />
    </>
  )
});

export const EmailMessageTemplateCourseAdultRegistrationConfirmation: EmailMessageWithContentTemplate<{ registrations: { id: CourseRegistration['id'], course: Parameters<typeof displayCourseName>[0] }[] }> = withContent({
  type: EmailMessageType.SESSION_REGISTRATION,
  subject: ({ registrations }) => registrations.length !== 1 ? `Vos inscriptions à des séances de yoga` : `Votre inscription à une séance de yoga`,
  body: ({ registrations }) => (
    <>
      J'ai le plaisir de vous confirmer
      {' '}
      {registrations.length !== 1 ? (
        <>vos inscriptions aux séances de yoga suivantes :</>
      ) : (
        <>votre inscription à la séance de yoga suivante :</>
      )}
      <ul>
        {registrations.sort(({ course: { dateStart: d1 } }, { course: { dateStart: d2 } }) => d1 < d2 ? -1 : 1).map(({ id, course }) => (
          <li key={id}>
            {displayCourseName(course)}
          </li>
        ))}
      </ul>
      <br />
      S'il s'agit de votre première participation, des informations pratiques vous seront communiquées la veille de votre séance.
      <br />
      <br />
      Je me réjouis d'avance de vous y retrouver.
      <br />
      <br />
    </>
  ),
});
