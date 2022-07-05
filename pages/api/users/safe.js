import { USER_TYPE_ADMIN, schemaUserBody } from '../../../lib/common';
import { apiHandler, prisma } from '../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaUserBody,
      action: async ({ accept, body }) => {
        const result = await prisma.user.create({ data: body });

        accept(result);
      },
    },
  })(req, res);
}
