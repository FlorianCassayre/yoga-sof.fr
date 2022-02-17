import { renderSessionName } from '../../components/table';

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
  ].map((obj) => [obj.id, obj])
);

const emailTemplatePartSubjectSuffix = '- Yoga Sof';
const emailSubject = (subject) => `${subject} ${emailTemplatePartSubjectSuffix}`;

const EmailContent = ({ user: { name }, children }) => (
  <>
    {name},<br />
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

export const emailSessionCanceledSubjectFor = () => emailSubject(`Notification d'annulation de séance`);

export const EmailSessionCanceledBody = ({ user, session }) => (
  <EmailContent user={user}>
    La {renderSessionName(session, false)} a malheureusement été annulée.
    <br />
    {session.cancelation_reason && (
      <>
        {session.cancelation_reason}
        <br />
      </>
    )}
    <br />
    Vous pouvez consulter vos inscriptions en suivant <a href={`${process.env.NEXTAUTH_URL}/mes-inscriptions`}>ce lien</a>.<br />
    <br />
    Merci de votre compréhension.
    <br />
  </EmailContent>
);
