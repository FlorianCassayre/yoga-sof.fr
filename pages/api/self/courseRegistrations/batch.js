import { ALL_USER_TYPES, IS_REGISTRATION_DISABLED, schemaSelfRegistrationBatchBody } from '../../../../lib/common';
import { apiHandler, notifyCourseRegistration, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: ALL_USER_TYPES,
      schemaBody: schemaSelfRegistrationBatchBody,
      action: async ({ reject, accept, userId, body: { courses } }) => {
        if (IS_REGISTRATION_DISABLED) {
          reject('Bad Request: temporarily disabled');
          return;
        }

        const now = new Date();

        try {
          await prisma.$transaction(
            courses.map(
              courseId => prisma.$executeRaw`
              INSERT INTO course_registration (course_id, user_id, created_at) VALUES (
                (SELECT id FROM course AS tmp1 WHERE
                  id = ${courseId} AND
                  NOT is_canceled AND
                  ${now} < date_start AND
                  bundle_id IS NULL AND
                  NOT EXISTS(SELECT * FROM course_registration AS tmp2 WHERE user_id = ${userId} AND course_id = ${courseId} AND NOT is_user_canceled) AND
                  (SELECT COUNT(*) FROM course_registration AS tmp3 WHERE course_id = ${courseId} AND NOT is_user_canceled) < slots),
                ${userId}, ${new Date()}
            )
          `,
            ),
          );

          await notifyCourseRegistration(userId, courses);

          accept({});
        } catch (e) {
          console.error(e);
          reject('Bad Request');
        }
      },
    },
  })(req, res);
}
