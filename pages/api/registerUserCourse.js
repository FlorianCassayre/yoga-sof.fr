import { USER_TYPE_ADMIN, schemaRegisterBody } from '../../lib/common';
import { apiHandler, notifyCourseRegistration, prisma } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaRegisterBody,
      action: async ({ accept, reject, body: { userId, courseId, notify } }) => {
        try {
          const result = await prisma.$transaction(async () => {
            const existsRegistration = !!(await prisma.courseRegistration.count({
              where: {
                courseId,
                userId,
                isUserCanceled: false,
                // TODO (check date) + cancel status
              },
            }));

            if (existsRegistration) {
              throw new Error('user is already registered');
            }

            const course = await prisma.course.findUnique({
              where: { id: courseId },
              include: { registrations: true },
            });

            if (course.registrations.filter(({ isUserCanceled }) => !isUserCanceled).length >= course.slots) {
              throw new Error('course is full');
            }

            return prisma.courseRegistration.create({
              data: {
                courseId,
                userId,
              },
            });
          });

          if (notify) {
            await notifyCourseRegistration(userId, [courseId]);
          }

          accept(result);
        } catch (error) {
          console.error(error);
          reject('Bad Request: illegal', 400);
        }
      },
    },
  })(req, res);
}
