import { ALL_USER_TYPES, schemaSelfUserBody } from '../../../lib/common';
import { apiHandler, prisma } from '../../../lib/server';

const select = {
  name: true,
  email: true,
  customEmail: true,
  customName: true,
  receiveEmails: true,
};

const transformResult = ({ name, email, customEmail, customName, receiveEmails }) => ({
  customName: customName || name,
  customEmail: customEmail || email,
  receiveEmails,
});

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      permissions: ALL_USER_TYPES,
      action: async ({ userId, accept }) => {
        const result = await prisma.user.findUnique({
          where: { id: userId },
          select,
        });

        accept(transformResult(result));
      },
    },
    POST: {
      permissions: ALL_USER_TYPES,
      schemaBody: schemaSelfUserBody,
      action: async ({ body: { customName, customEmail, receiveEmails }, userId, accept }) => {
        const result = await prisma.user.update({
          where: { id: userId },
          data: {
            customName,
            customEmail: customEmail !== null ? customEmail.toLowerCase() : customEmail,
            receiveEmails,
          },
          select,
        });

        accept(transformResult(result));
      },
    },
  })(req, res);
}
