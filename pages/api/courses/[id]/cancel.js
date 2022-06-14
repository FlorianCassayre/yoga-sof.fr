import { USER_TYPE_ADMIN, schemaCourseCancelBody, schemaCourseCancelQuery } from '../../../../lib/common';
import { apiHandler, notifyCourseCanceled, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaCourseCancelQuery,
      schemaBody: schemaCourseCancelBody,
      action: async ({ accept, reject, query: { id: courseId }, body: { cancelationReason } }) => {
        const result = await prisma.course.updateMany({
          where: {
            id: courseId,
            isCanceled: false,
            dateStart: { gt: new Date() },
          },
          data: {
            isCanceled: true,
            cancelationReason,
          },
        });

        if (result.count === 1) {
          // Note: updateMany does not support select

          const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { registrations: { include: { user: true } } },
          });

          await notifyCourseCanceled(course);

          accept({});
        } else {
          reject('Bad request: impossible to cancel this course', 400);
        }
      },
    },
  })(req, res);
}