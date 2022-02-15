import nodemailer from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmailSessionCanceledBody, emailSessionCanceledSubjectFor } from '../common';

const NAME_FROM = 'Yoga Sof';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const sendEmail = async (recipient, subject, contentHtml) => {
  const parameters = {
    from: `"${NAME_FROM}" <${process.env.EMAIL_FROM}>`,
    replyTo: `${NAME_FROM}" <${process.env.EMAIL_REPLY_TO}>`,
    to: recipient,
    subject: subject,
    html: contentHtml,
  };

  if(process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    await transporter.sendMail(parameters);
  } else {
    console.log('The system tried to send an email inside the development environment. Because this feature is disabled the content is shown below instead:');
    console.log(parameters);
  }
};

const EMAIL_TYPE_SESSION_CANCELED = 'SESSION_CANCELED';
const EMAIL_TYPE_OTHER = 'OTHER';

const dispatchEmail = async (user, emailType, subject, contentHtml) => {
  const { id: userId, email } = user;

  const { id: emailRecordId } = await prisma.emails.create({
    data: {
      user_id: userId,
      type: emailType,
      destination_address: email,
      subject: subject,
      message: contentHtml,
    },
  });

  try {
    await sendEmail(email, subject, contentHtml);
  } catch (e) {
    console.log(`Warning, could not send email #${emailRecordId}`);
    console.error(e);
    return;
  }

  await prisma.emails.update({
    where: {
      id: emailRecordId,
    },
    data: {
      sent_at: new Date().toISOString(),
    },
  });
};

const dispatchEmailFromComponent = async (user, emailType, subject, component) => {
  return await dispatchEmail(user, emailType,subject, renderToStaticMarkup(component))
};

export const notifySessionCanceled = async session => {
  const { registrations } = session;
  await Promise.all(registrations
    .filter(({ is_user_canceled }) => !is_user_canceled)
    .filter(({ user: { email } }) => email)
    .map(({ user }) =>
      dispatchEmailFromComponent(
        user,
        EMAIL_TYPE_SESSION_CANCELED,
        emailSessionCanceledSubjectFor(),
        <EmailSessionCanceledBody user={user} session={session} />,
      )
    )
  );
};
