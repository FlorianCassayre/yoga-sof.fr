import {
  courseBundlesTable,
  coursesTable,
  type CourseType,
  REGISTRATION_CONFIRMATION_TEMPLATE,
} from '@yoga-sof/core';
import { type DbTransaction, emailService, renderEmail, usersTable } from '@yoga-sof/core/server';
import { eq, inArray, or, sql } from 'drizzle-orm';

interface CreatedRegistration {
  id: number;
  courseId: number | null;
  courseBundleId: number | null;
  userId: string;
}

// Creates one registration confirmation e-mail per registered user, about the
// courses of their own registrations (bundle registrations cover every course
// of their bundle). Users without an e-mail address are skipped.
export const createRegistrationEmails = async (
  tx: DbTransaction,
  registrations: CreatedRegistration[],
) => {
  const userIds = [...new Set(registrations.map(({ userId }) => userId))];
  const courseIds = [
    ...new Set(registrations.flatMap(({ courseId }) => (courseId === null ? [] : [courseId]))),
  ];
  const bundleIds = [
    ...new Set(
      registrations.flatMap(({ courseBundleId }) =>
        courseBundleId === null ? [] : [courseBundleId],
      ),
    ),
  ];

  const users = await tx
    .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name })
    .from(usersTable)
    .where(inArray(usersTable.id, userIds));
  const courses =
    courseIds.length > 0 || bundleIds.length > 0
      ? await tx
          .select({
            id: coursesTable.id,
            courseBundleId: coursesTable.courseBundleId,
            type: sql<CourseType>`coalesce(${coursesTable.type}, ${courseBundlesTable.type})`,
            startsAt: coursesTable.startsAt,
            endsAt: coursesTable.endsAt,
          })
          .from(coursesTable)
          .leftJoin(courseBundlesTable, eq(courseBundlesTable.id, coursesTable.courseBundleId))
          .where(
            or(
              courseIds.length > 0 ? inArray(coursesTable.id, courseIds) : undefined,
              bundleIds.length > 0 ? inArray(coursesTable.courseBundleId, bundleIds) : undefined,
            ),
          )
      : [];

  for (const user of users) {
    if (user.email === null) {
      continue;
    }
    const userRegistrations = registrations
      .filter((registration) => registration.userId === user.id)
      .flatMap((registration) => {
        if (registration.courseId !== null) {
          const course = courses.find((course) => course.id === registration.courseId);

          return course === undefined ? [] : [{ course }];
        }

        return courses
          .filter((course) => course.courseBundleId === registration.courseBundleId)
          .map((course) => ({ course }));
      });
    const email = await renderEmail(REGISTRATION_CONFIRMATION_TEMPLATE, {
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
