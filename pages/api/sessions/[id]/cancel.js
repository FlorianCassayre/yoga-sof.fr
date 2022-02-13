import { USER_TYPE_ADMIN } from '../../../../lib/common';
import { schemaSessionCancelBody, schemaSessionCancelQuery } from '../../../../lib/common';
import { apiHandler } from '../../../../lib/server';
import { notifySessionCanceled } from '../../../../lib/server/email';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaSessionCancelQuery,
      schemaBody: schemaSessionCancelBody,
      action: async (req, res, { accept, reject, query: { id: sessionId }, body: { cancelation_reason } }) => {
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
            cancelation_reason,
          },
        });

        if(result.count === 1) {
          // Note: updateMany does not support select

          const session = await prisma.sessions.findUnique({
            where: {
              id: sessionId,
            },
            include: {
              registrations: {
                include: {
                  user: true,
                }
              }
            }
          });

          await notifySessionCanceled(session);

          accept({});
        } else {
          reject('Bad request: impossible to cancel this session', 400);
        }
      },
    }
  })(req, res);
}
