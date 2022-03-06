import { ALL_USER_TYPES, schemaSelfRegistrationCancelQuery } from '../../../../../lib/common';
import { apiHandler, prisma } from '../../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: ALL_USER_TYPES,
      schemaQuery: schemaSelfRegistrationCancelQuery,
      action: async ({ accept, reject, userId, query: { id: registrationId } }) => {
        const result = await prisma.courseRegistration.updateMany({
          where: {
            id: registrationId,
            userId,
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
