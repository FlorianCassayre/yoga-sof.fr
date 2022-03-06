import { USER_TYPE_ADMIN, schemaRegistrationCancelQuery } from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaRegistrationCancelQuery,
      action: async ({ accept, reject, query: { id: registrationId } }) => {
        const result = await prisma.courseRegistration.updateMany({
          where: {
            id: registrationId,
            isUserCanceled: false,
            course: {
              dateStart: { gt: new Date() },
              isCanceled: false,
            },
          },
          data: {
            isUserCanceled: true,
            canceledAt: new Date(),
          },
        });

        if (result.count === 1) {
          accept({});
        } else {
          reject('Bad Request', 400);
        }
      },
    },
  })(req, res);
}
