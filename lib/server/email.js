import nodemailer from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import { EmailCourseCanceledBody, emailCourseCanceledSubjectFor } from '../common';
import { prisma } from './prisma';

const NAME_FROM = 'Yoga Sof';

export const NODEMAILER_CONFIGURATION = {
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(NODEMAILER_CONFIGURATION);

const sendEmail = async (recipient, subject, contentHtml) => {
  const parameters = {
    from: `"${NAME_FROM}" <${process.env.EMAIL_FROM}>`,
    replyTo: `${NAME_FROM}" <${process.env.EMAIL_REPLY_TO}>`,
    to: recipient,
    subject,
    html: contentHtml,
  };

  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    await transporter.sendMail(parameters);
  } else {
    console.warn('The system tried to send an email inside the development environment. Because this feature is disabled the content is shown below instead:');
    console.warn(parameters);
  }
};

const EMAIL_TYPE_SESSION_CANCELED = 'SESSION_CANCELED';
const EMAIL_TYPE_OTHER = 'OTHER'; // eslint-disable-line no-unused-vars

const dispatchEmail = async (user, emailType, subject, contentHtml) => {
  const { id: userId, email } = user;

  const { id: emailRecordId } = await prisma.emailMessage.create({
    data: {
      userId,
      type: emailType,
      destinationAddress: email,
      subject,
      message: contentHtml,
    },
  });

  try {
    await sendEmail(email, subject, contentHtml);
  } catch (e) {
    console.warn(`Warning, could not send email #${emailRecordId}`);
    console.error(e);
    return;
  }

  await prisma.emailMessage.update({
    where: { id: emailRecordId },
    data: { sentAt: new Date().toISOString() },
  });
};

const dispatchEmailFromComponent = async (user, emailType, subject, component) => dispatchEmail(user, emailType, subject, renderToStaticMarkup(component));

export const notifyCourseCanceled = async course => {
  const { registrations } = course;
  await Promise.all(
    registrations
      .filter(({ isUserCanceled }) => !isUserCanceled)
      .filter(({ user: { email, receiveEmails } }) => email && receiveEmails)
      .map(({ user }) => dispatchEmailFromComponent(user, EMAIL_TYPE_SESSION_CANCELED, emailCourseCanceledSubjectFor(), <EmailCourseCanceledBody user={user} course={course} />)),
  );
};
