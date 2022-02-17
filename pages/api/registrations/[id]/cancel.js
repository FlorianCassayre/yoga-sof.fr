import { USER_TYPE_ADMIN } from '../../../../lib/common';
import { schemaRegistrationCancelQuery } from '../../../../lib/common';
import { apiHandler } from '../../../../lib/server';
import { prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaRegistrationCancelQuery,
      action: async (req, res, { accept, reject, query: { id: registrationId } }) => {
        const result = await prisma.registrations.updateMany({
          where: {
            id: registrationId,
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

        if (result.count === 1) {
          accept({});
        } else {
          reject('Bad Request', 400);
        }
      },
    },
  })(req, res);
}
