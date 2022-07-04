import { displayCourseName, displayUserName } from './display';

export const EMAIL_TYPES = Object.fromEntries(
  [
    {
      id: 'SESSION_CANCELED',
      title: 'Annulation de séance',
    },
    {
      id: 'OTHER',
      title: 'Autre',
    },
  ].map(obj => [obj.id, obj]),
);

const emailTemplatePartSubjectSuffix = '- Yoga Sof';
const emailSubject = subject => `${subject} ${emailTemplatePartSubjectSuffix}`;

function EmailContent({ user, children }) {
  return (
    <>
      {displayUserName(user)}
      ,
      <br />
      <br />
      {children}
      Cordialement,
      <br />
      L'équipe Yoga Sof.
      <br />
      <br />
      <a href={process.env.NEXTAUTH_URL}>yoga-sof.fr</a>
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
      Vous pouvez consulter vos inscriptions en suivant
      {' '}
      <a href={`${process.env.NEXTAUTH_URL}/mes-inscriptions`}>ce lien</a>
      .
      <br />
      <br />
      Merci de votre compréhension.
      <br />
    </EmailContent>
  );
}
