import { ALL_USER_TYPES, schemaSelfRegistrationCancelQuery } from '../../../../../lib/common';
import { apiHandler } from '../../../../../lib/server';
import { prisma } from '../../../../../server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: ALL_USER_TYPES,
      schemaQuery: schemaSelfRegistrationCancelQuery,
      action: async (req, res, { accept, reject, userId, query: { id: registrationId } }) => {
        const result = await prisma.registrations.updateMany({
          where: {
            id: registrationId,
            user_id: userId,
            is_user_canceled: false,
            session: {
              date_start: {
                gt: new Date(),
              },
              is_canceled: false,
            },
          },
          data: {
            is_user_canceled: true,
            canceled_at: new Date(),
          },
        });

        if(result.count === 1) {
          accept({});
        } else {
          reject('Bad Request', 400);
        }
      },
    },
  })(req, res);
}
