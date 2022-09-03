import {
  USER_TYPE_ADMIN,
  schemaCourseBody, schemaCourseQuery,
} from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    PUT: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaCourseQuery,
      schemaBody: schemaCourseBody,
      action: async ({ accept, reject, body: { slots, notes }, query: { id } }) => {
        try {
          const result = await prisma.$transaction(async () => {
            const count = await prisma.courseRegistration.count({
              where: {
                courseId: id,
                isUserCanceled: false,
                course: {
                  dateStart: { gt: new Date() },
                },
              },
            });
            if (slots < count) {
              throw new Error('fewer slots than registered users');
            }
            return prisma.course.update({
              where: { id },
              data: { slots, notes },
            });
          });

          accept(result);
        } catch (error) {
          console.error(error);
          reject('Bad Request: illegal', 400);
        }
      },
    },
  })(req, res);
}
