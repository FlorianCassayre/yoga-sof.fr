import nodemailer from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import { prisma, writeTransaction } from './prisma';
import { CourseType, EmailMessageType, Prisma, User } from '@prisma/client';
import {
  EmailMessageTemplate
} from '../common/emailMessages';
import {
  EmailMessageTemplateCourseAdultRegistrationConfirmation,
  EmailMessageTemplateCourseAdultReminderNewcomer,
  EmailMessageTemplateCourseCanceled, EmailMessageTemplateOrderCreatedInformation
} from '../../contents/emailMessages';
import Mail from 'nodemailer/lib/mailer';

const NAME_FROM = 'Yoga Sof';

export const NODEMAILER_CONFIGURATION = {
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(NODEMAILER_CONFIGURATION);

const sendEmail = async (to: string | null, cc: string | null, subject: string, contentHtml: string, attachments?: { filename: string, file: Buffer }[]) => {
  const parameters: Mail.Options = {
    from: `"${NAME_FROM}" <${process.env.EMAIL_FROM}>`,
    replyTo: `"${NAME_FROM}" <${process.env.EMAIL_REPLY_TO}>`,
    to: to ?? undefined,
    cc: cc ?? undefined,
    subject,
    html: contentHtml,
    attachments: attachments?.map(({ filename, file }) => ({ filename, content: file })),
  };

  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    await transporter.sendMail(parameters);
  } else {
    console.warn('The system tried to send an email inside the development environment. Because this feature is disabled the content is shown below instead:');
    console.warn({ ...parameters, attachments: attachments?.map(o => ({ ...o, file: `(${o.file.length} bytes)` })) });
  }
};

const dispatchEmail = async (tx: Prisma.TransactionClient, user: Pick<User, 'id' | 'email' | 'customEmail'>, managedByUser: Pick<User, 'email' | 'customEmail'> | null, emailType: EmailMessageType, subject: string, contentHtml: string, attachments?: { filename: string, file: Buffer }[]): Promise<() => Promise<void>> => {
  const { id: userId } = user;

  const actualToEmail = user.customEmail || user.email;
  const actualCcEmail = managedByUser ? managedByUser.customEmail || managedByUser.email : null;
  if (!actualToEmail && !actualCcEmail) { // Do not create or send the email if there are no destination addresses, just ignore it
    return async () => {};
  }

  const { id: emailRecordId } = await tx.emailMessage.create({
    data: {
      userId,
      type: emailType,
      destinationAddress: actualToEmail,
      ccAddress: actualCcEmail,
      subject,
      message: contentHtml,
      attachments: {
        create: attachments,
      },
    },
  });

  return async () => {
    try {
      await sendEmail(actualToEmail, actualCcEmail, subject, contentHtml, attachments);
    } catch (e) {
      console.warn(`Warning, could not send email with id ${emailRecordId}`);
      console.error(e);
      return;
    }

    await prisma.emailMessage.update({
      where: { id: emailRecordId },
      data: { sentAt: new Date().toISOString() },
    });
  }
};

const dispatchEmailFromComponent = async <
  Args extends { user: Prisma.UserGetPayload<{ select: { id: true, email: true, customEmail: true } }> },
  Props extends Args & { user: Prisma.UserGetPayload<{ select: { managedByUser: { select: { email: true, customEmail: true } } } }> },
>
(prisma: Prisma.TransactionClient, template: EmailMessageTemplate<Args>, props: Props) => {
  const attachments = template.attachments !== undefined ? await template.attachments(prisma, props) : undefined;
  return dispatchEmail(prisma, props.user, props.user.managedByUser, template.type, template.subject(props), renderToStaticMarkup(template.body(props)), attachments);
}

export const notifyCourseCanceled = async (prisma: Prisma.TransactionClient, course: Prisma.CourseGetPayload<{ include: { registrations: { include: { user: { include: { managedByUser: true } } } } } }>) => {
  const { registrations } = course;
  const callbacks = await Promise.all(
    registrations
      .filter(({ isUserCanceled }) => !isUserCanceled)
      .map(({ user }) => dispatchEmailFromComponent(prisma, EmailMessageTemplateCourseCanceled, { user, course })),
  );
  return async () => {
    await Promise.all(callbacks.map(callback => callback()));
  }
};

export const notifyCourseNewcomers = async () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setMilliseconds(0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const actualRegistrations = await writeTransaction(async (prisma) => {
    const registrations = await prisma.courseRegistration.findMany({
      where: {
        AND: [
          {
            isUserCanceled: false,
            reminderSent: false,
            course: {
              type: CourseType.YOGA_ADULT,
              isCanceled: false,
            },
          },
          {
            course: {
              dateStart: {
                gt: tomorrow.toISOString(),
              },
            },
          },
          {
            course: {
              dateStart: {
                lt: dayAfterTomorrow.toISOString(),
              },
            },
          },
        ],
      },
      include: {
        course: true,
        user: {
          include: {
            managedByUser: true,
          },
        },
      },
    });

    const validRegistrations = [];
    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      const registrationId = registration.id;
      const userId = registration.user.id;
      // eslint-disable-next-line
      const firstRegistrationId = await prisma.courseRegistration.findFirst({
        where: {
          userId,
          isUserCanceled: false,
          course: {
            type: CourseType.YOGA_ADULT,
          },
        },
        orderBy: {
          course: {
            dateStart: 'asc',
          },
        },
        select: {
          id: true,
        },
      });
      if (firstRegistrationId != null && registrationId === firstRegistrationId.id) {
        validRegistrations.push(registration);
      }
    }

    await Promise.all(validRegistrations.map(({ id }) => prisma.courseRegistration.update({ where: { id }, data: { reminderSent: true } })));

    return validRegistrations;
  });

  const callbacks = await Promise.all(
    actualRegistrations
      .map(registration => dispatchEmailFromComponent(
        prisma,
        EmailMessageTemplateCourseAdultReminderNewcomer,
        { user: registration.user, course: registration.course },
      )),
  );
  return async () => {
    await Promise.all(callbacks.map(callback => callback()));
  }
};

export const notifyCourseRegistration = async (
  prisma: Prisma.TransactionClient,
  user: Prisma.UserGetPayload<{ include: { managedByUser: true } }>,
  registrations: Prisma.CourseRegistrationGetPayload<{ include: { course: true } }>[],
) => {
  return dispatchEmailFromComponent(
    prisma,
    EmailMessageTemplateCourseAdultRegistrationConfirmation,
    { user, registrations }
  );
};

export const notifyOrderCreated = async (
  prisma: Prisma.TransactionClient,
  order: Prisma.OrderGetPayload<{ include: { payment: true, user: { include: { managedByUser: true } } } }>,
) => {
  return dispatchEmailFromComponent(
    prisma,
    EmailMessageTemplateOrderCreatedInformation,
    { user: order.user, order }
  );
};
