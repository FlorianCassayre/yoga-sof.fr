import {
  schemaUserDisabledBody,
  schemaUserDisabledQuery,
  USER_TYPE_ADMIN,
} from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaQuery: schemaUserDisabledQuery,
      schemaBody: schemaUserDisabledBody,
      action: async ({ accept, body, query: { id } }) => {
        await prisma.user.update({ where: { id }, data: body });

        accept({});
      },
    },
  })(req, res);
}
