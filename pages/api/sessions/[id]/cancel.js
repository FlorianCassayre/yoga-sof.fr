import { USER_TYPE_ADMIN, schemaSessionCancelBody, schemaSessionCancelQuery } from '../../../../lib/common';
import { apiHandler, notifySessionCanceled, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaSessionCancelQuery,
      schemaBody: schemaSessionCancelBody,
      action: async ({ accept, reject, query: { id: sessionId }, body: { cancelation_reason: cancelationReason } }) => {
        const result = await prisma.sessions.updateMany({
          where: {
            id: sessionId,
            is_canceled: false,
            date_start: { gt: new Date() },
          },
          data: {
            is_canceled: true,
            cancelation_reason: cancelationReason,
          },
        });

        if (result.count === 1) {
          // Note: updateMany does not support select

          const session = await prisma.sessions.findUnique({
            where: { id: sessionId },
            include: { registrations: { include: { user: true } } },
          });

          await notifySessionCanceled(session);

          accept({});
        } else {
          reject('Bad request: impossible to cancel this session', 400);
        }
      },
    },
  })(req, res);
}
