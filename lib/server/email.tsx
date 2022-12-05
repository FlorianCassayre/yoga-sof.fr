import nodemailer from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import { prisma } from './prisma';
import { CourseType, EmailMessageType, Prisma, User } from '@prisma/client';
import {
  EmailMessageTemplate
} from '../common/emailMessages';
import {
  EmailMessageTemplateCourseAdultRegistrationConfirmation,
  EmailMessageTemplateCourseAdultReminderNewcomer,
  EmailMessageTemplateCourseCanceled
} from '../../contents/emailMessages';

const NAME_FROM = 'Yoga Sof';

export const NODEMAILER_CONFIGURATION = {
  host: process.env.EMAIL_SERVER_HOST as string,
  port: parseInt(process.env.EMAIL_SERVER_PORT as string) as number,
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER as string,
    pass: process.env.EMAIL_SERVER_PASSWORD as string,
  },
};

const transporter = nodemailer.createTransport(NODEMAILER_CONFIGURATION);

const sendEmail = async (recipient: string, subject: string, contentHtml: string) => {
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

const dispatchEmail = async (user: Pick<User, 'id' | 'email' | 'customEmail'>, emailType: EmailMessageType, subject: string, contentHtml: string) => {
  const { id: userId, email, customEmail } = user;

  const actualEmail = customEmail || email;
  if (!actualEmail) {
    throw new Error('The email cannot be empty: ' + actualEmail);
  }

  const { id: emailRecordId } = await prisma.emailMessage.create({
    data: {
      userId,
      type: emailType,
      destinationAddress: actualEmail,
      subject,
      message: contentHtml,
    },
  });

  try {
    await sendEmail(actualEmail, subject, contentHtml);
  } catch (e) {
    console.warn(`Warning, could not send email with id ${emailRecordId}`);
    console.error(e);
    return;
  }

  await prisma.emailMessage.update({
    where: { id: emailRecordId },
    data: { sentAt: new Date().toISOString() },
  });
};

const dispatchEmailFromComponent = async <Props extends { user: Pick<User, 'id' | 'email' | 'customEmail'> },>(template: EmailMessageTemplate<Props>, props: Props) => {
  return dispatchEmail(props.user, template.type, template.subject(props), renderToStaticMarkup(template.body(props)));
}

export const notifyCourseCanceled = async (course: Prisma.CourseGetPayload<{ include: { registrations: { include: { user: true } } } }>) => {
  const { registrations } = course;
  await Promise.all(
    registrations
      .filter(({ isUserCanceled }) => !isUserCanceled)
      .filter(({ user: { email, customEmail } }) => customEmail || email)
      .map(({ user }) => dispatchEmailFromComponent(EmailMessageTemplateCourseCanceled, { user, course })),
  );
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

  const actualRegistrations = await prisma.$transaction(async () => {
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
        user: true,
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

  return Promise.all(
    actualRegistrations
      .filter(({ user: { email, customEmail } }) => customEmail || email)
      .map(registration => dispatchEmailFromComponent(
        EmailMessageTemplateCourseAdultReminderNewcomer,
        { user: registration.user, course: registration.course },
      )),
  );
};

export const notifyCourseRegistration = async (userId: number, courseIds: number[]) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  const registrations = await prisma.courseRegistration.findMany({
    where: {
      userId: user.id,
      courseId: {
        in: courseIds,
      },
      isUserCanceled: false,
    },
    include: {
      course: true,
    },
  });

  return dispatchEmailFromComponent(
    EmailMessageTemplateCourseAdultRegistrationConfirmation,
    { user, registrations }
  );
};
