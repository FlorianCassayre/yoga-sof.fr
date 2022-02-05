import { USER_TYPE_ADMIN } from '../../../../components';
import { schemaSessionCancelQuery } from '../../../../lib/common';
import { apiHandler } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaSessionCancelQuery,
      action: async (req, res, { accept, reject, query: { id: sessionId } }) => {
        const result = await prisma.sessions.updateMany({
          where: {
            id: sessionId,
            is_canceled: false,
            date_start: {
              gt: new Date(),
            }
          },
          data: {
            is_canceled: true,
          },
        });

        // TODO send email to all participants (by retrieving the updated rows)

        if(result.count === 1) {
          accept({});
        } else {
          reject('Bad request: impossible to cancel this session', 400);
        }
      },
    }
  })(req, res);
}
