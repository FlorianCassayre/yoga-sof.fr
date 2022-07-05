import { USER_TYPE_ADMIN, schemaRegistrationAttendedBody, schemaRegistrationQuery } from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaRegistrationQuery,
      schemaBody: schemaRegistrationAttendedBody,
      action: async ({ accept, reject, body: { attended }, query: { id: registrationId } }) => {
        const result = await prisma.courseRegistration.updateMany({
          where: {
            id: registrationId,
            isUserCanceled: false,
            course: {
              isCanceled: false,
            },
          },
          data: {
            attended,
          },
        });

        if (result.count === 1) {
          // TODO https://github.com/prisma/prisma/issues/5098
          const resultNonAtomic = await prisma.courseRegistration.findUnique({ where: { id: registrationId } });
          accept(resultNonAtomic);
        } else {
          reject('Bad Request', 400);
        }
      },
    },
  })(req, res);
}
