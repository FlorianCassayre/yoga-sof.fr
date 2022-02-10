import { ALL_USER_TYPES } from '../../../../components';
import { IS_REGISTRATION_DISABLED, schemaSelfRegistrationBatchBody } from '../../../../lib/common';
import { apiHandler } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: ALL_USER_TYPES,
      schemaBody: schemaSelfRegistrationBatchBody,
      action: async (req, res, { reject, accept, userId, body: { sessions } }) => {
        if(IS_REGISTRATION_DISABLED) {
          reject('Bad Request: temporarily disabled');
          return;
        }

        const now = new Date();

        try {
          await prisma.$transaction(sessions.map(sessionId =>
            prisma.$executeRaw`
              INSERT INTO registrations (session_id, user_id) VALUES (
                (SELECT id FROM sessions AS tmp1 WHERE
                  id = ${sessionId} AND
                  NOT is_canceled AND
                  ${now} < date_start AND
                  NOT EXISTS(SELECT * FROM registrations AS tmp2 WHERE user_id = ${userId} AND session_id = ${sessionId} AND NOT is_user_canceled) AND
                  (SELECT COUNT(*) FROM registrations AS tmp3 WHERE session_id = ${sessionId} AND NOT is_user_canceled) < slots),
                ${userId}
            )
          `));

          accept();
        } catch(e) {
          reject('Bad Request');
        }
      }
    },
  })(req, res);
}
