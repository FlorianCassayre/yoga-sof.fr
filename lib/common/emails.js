import { LOCATION_HOME } from './config';
import { displayCourseName, displayUserName } from './display';
import { urlForLocation } from './urls';

export const EMAIL_TYPE_SESSION_CANCELED = 'SESSION_CANCELED';
export const EMAIL_TYPE_SESSION_REMINDER_NEWCOMER = 'SESSION_REMINDER_NEWCOMER';
export const EMAIL_TYPE_REGISTRATION = 'SESSION_REGISTRATION';
export const EMAIL_TYPE_OTHER = 'OTHER';

export const EMAIL_TYPES = Object.fromEntries(
  [
    {
      id: EMAIL_TYPE_SESSION_CANCELED,
      title: 'Annulation de séance',
    },
    {
      id: EMAIL_TYPE_SESSION_REMINDER_NEWCOMER,
      title: 'Rappel de séance pour nouveaux arrivants',
    },
    {
      id: EMAIL_TYPE_REGISTRATION,
      title: 'Inscription à des séances',
    },
    {
      id: EMAIL_TYPE_OTHER,
      title: 'Autre',
    },
  ].map(obj => [obj.id, obj]),
);

const emailTemplatePartSubjectSuffix = '- Yoga Sof';
const emailSubject = subject => `${subject} ${emailTemplatePartSubjectSuffix}`;

function EmailContent({ user, children, casual }) {
  return (
    <>
      {displayUserName(user)}
      ,
      <br />
      <br />
      {children}
      {casual ? 'Namasté,' : 'Cordialement,'}
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
  );
}

export const emailCourseCanceledSubjectFor = () => emailSubject('Notification d\'annulation de séance');

export function EmailCourseCanceledBody({ user, course }) {
  return (
    <EmailContent user={user}>
      La
      {' '}
      {displayCourseName(course, false)}
      {' '}
      a malheureusement été annulée.
      <br />
      {course.cancelationReason && (
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
    </EmailContent>
  );
}

export const emailCourseAdultReminderNewcomerSubjectFor = course => emailSubject(`Votre ${displayCourseName(course, false)}`);

export function EmailCourseAdultReminderNewcomerBody({ user, course }) {
  return (
    <EmailContent user={user} casual>
      J'ai le plaisir de vous rappeler votre inscription à la
      {' '}
      {displayCourseName(course, false)}
      ,
      {' '}
      je vous attends au
      {' '}
      <a href={urlForLocation(LOCATION_HOME)} target="_blank" rel="noopener noreferrer">8 rue des Moissonneurs</a>
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
    </EmailContent>
  );
}

export const emailAdultCourseRegistrationSubjectFor = registrations => emailSubject(registrations.length !== 1 ? `Vos inscriptions à des séances de yoga` : `Votre inscription à une séance de yoga`);

export function EmailAdultCourseRegistrationBody({ user, registrations }) {
  return (
    <EmailContent user={user} casual>
      J'ai le plaisir de vous confirmer
      {' '}
      {registrations.length !== 1 ? `vos inscriptions aux séances de yoga suivantes :` : `votre inscription à la séance de yoga suivante :`}
      <ul>
        {registrations.map(({ id, course }) => (
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
    </EmailContent>
  );
}
