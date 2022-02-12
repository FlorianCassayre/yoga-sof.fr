import { renderSessionName } from '../../components';

const emailTemplatePartSubjectSuffix = '- Yoga Sof';

const emailTemplatePartHeaderFor = ({ name }) => `
${name},<br/>
<br/>
`.trim();

const emailTemplatePartFooterFor = ({  }) => `
Cordialement,<br/>
L'équipe Yoga Sof.<br/>
<br/>
<a href="${process.env.NEXTAUTH_URL}">yoga-sof.fr</a>
`.trim();

export const emailTemplateSessionCanceledSubjectFor = (user, session) => `Notification d'annulation de séance ${emailTemplatePartSubjectSuffix}`

export const emailTemplateSessionCanceledBodyFor = (user, session) => `
${emailTemplatePartHeaderFor(user)}

La ${renderSessionName(session, false)} a malheureusement été annulée.<br/>
${session.cancelation_reason ? `${session.cancelation_reason}<br/>` : ''}
<br/>
Vous pouvez consulter vos inscriptions en suivant <a href="${process.env.NEXTAUTH_URL}/mes-inscriptions">ce lien</a>.<br/>
<br/>
Merci de votre compréhension.<br/>
${emailTemplatePartFooterFor(user)}
`.trim();
