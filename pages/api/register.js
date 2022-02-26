import { USER_TYPE_ADMIN, schemaRegisterBody } from '../../lib/common';
import { apiHandler, prisma } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaRegisterBody,
      action: async ({ accept, reject, body: { user_id: userId, session_id: sessionId } }) => {
        try {
          const result = await prisma.$transaction(async () => {
            const existsRegistration = !!(await prisma.registrations.count({
              where: {
                session_id: sessionId,
                user_id: userId,
                is_user_canceled: false,
                // TODO (check date) + cancel status
              },
            }));

            if (existsRegistration) {
              throw new Error('user is already registered');
            }

            return prisma.registrations.create({
              data: {
                session_id: sessionId,
                user_id: userId,
              },
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
