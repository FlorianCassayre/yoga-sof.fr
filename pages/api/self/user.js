import { ALL_USER_TYPES, schemaSelfUserBody } from '../../../lib/common';
import { apiHandler, prisma } from '../../../lib/server';

const select = {
  name: true,
  email: true,
  receive_emails: true,
};

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      permissions: ALL_USER_TYPES,
      action: async ({ userId, accept }) => {
        const result = await prisma.users.findUnique({
          where: { id: userId },
          select,
        });

        accept(result);
      },
    },
    POST: {
      permissions: ALL_USER_TYPES,
      schemaBody: schemaSelfUserBody,
      action: async ({ body: { name, email, receive_emails }, userId, accept }) => {
        const result = await prisma.users.update({
          where: { id: userId },
          data: {
            name,
            email: email !== null ? email.toLowerCase() : email,
            receive_emails,
          },
          select,
        });

        accept(result);
      },
    },
  })(req, res);
}
