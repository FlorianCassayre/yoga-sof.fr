import { COURSE_CANCELED_TEMPLATE, type CourseType } from '@yoga-sof/core';
import {
  type DbTransaction,
  emailService,
  type EmailUser,
  registrationService,
  renderEmail,
} from '@yoga-sof/core/server';

export const createCourseCanceledEmails = async (
  tx: DbTransaction,
  course: {
    id: number;
    type: CourseType;
    startsAt: Date;
    endsAt: Date;
    cancellationReason: string | null;
  },
) => {
  const recipients = await registrationService.listCourseRecipients({ courseId: course.id }, tx);

  for (const user of recipients) {
    if (user.email === null) {
      continue;
    }
    const emailUser: EmailUser = { id: user.id, name: user.name };
    const email = await renderEmail(COURSE_CANCELED_TEMPLATE, {
      user: emailUser,
      course,
      cancellationReason: course.cancellationReason,
    });

    await emailService.create(
      {
        userId: user.id,
        type: email.type,
        destinationAddress: user.email,
        subject: email.subject,
        message: email.html,
      },
      tx,
    );
  }
};
