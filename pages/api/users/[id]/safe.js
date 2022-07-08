import {
  USER_TYPE_ADMIN,
  schemaUserBody, schemaUserQuery,
} from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    PUT: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaUserQuery,
      schemaBody: schemaUserBody,
      action: async ({ accept, body: { name, email }, query: { id } }) => {
        const result = await prisma.user.update({
          where: { id },
          data: {
            customName: name,
            customEmail: email ? email.toLowerCase() : null,
          },
        });

        accept(result);
      },
    },
  })(req, res);
}
