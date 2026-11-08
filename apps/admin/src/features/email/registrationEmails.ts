import { COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, coursesTable } from '@yoga-sof/core';
import { type DbTransaction, emailService, renderEmail, usersTable } from '@yoga-sof/core/server';
import { inArray } from 'drizzle-orm';

interface CreatedRegistration {
  id: number;
  courseId: number;
  userId: string;
}

// Creates one registration confirmation e-mail per registered user, about the
// courses of their own registrations. Users without an e-mail address are
// skipped.
export const createRegistrationEmails = async (
  tx: DbTransaction,
  registrations: CreatedRegistration[],
) => {
  const userIds = [...new Set(registrations.map(({ userId }) => userId))];
  const courseIds = [...new Set(registrations.map(({ courseId }) => courseId))];

  const users = await tx
    .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name })
    .from(usersTable)
    .where(inArray(usersTable.id, userIds));
  const courses = await tx
    .select({
      id: coursesTable.id,
      type: coursesTable.type,
      startsAt: coursesTable.startsAt,
      endsAt: coursesTable.endsAt,
    })
    .from(coursesTable)
    .where(inArray(coursesTable.id, courseIds));

  for (const user of users) {
    if (user.email === null) {
      continue;
    }
    const userRegistrations = registrations
      .filter((registration) => registration.userId === user.id)
      .map((registration) => ({
        id: registration.id,
        course: courses.find((course) => course.id === registration.courseId)!,
      }));
    const email = await renderEmail(COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, {
      user,
      registrations: userRegistrations,
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
