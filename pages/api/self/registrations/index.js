import { ALL_USER_TYPES } from '../../../../lib/common';
import { apiHandler } from '../../../../lib/server';
import { prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      permissions: ALL_USER_TYPES,
      action: async (req, res, { userId, accept }) => {
        const result = await prisma.registrations.findMany({
          where: {
            user_id: userId,
          },
          select: {
            id: true,
            is_user_canceled: true,
            created_at: true,
            canceled_at: true,
            session: {
              select: {
                id: true,
                type: true,
                slots: true,
                price: true,
                date_start: true,
                date_end: true,
                is_canceled: true,
              },
            },
          },
        });

        accept(result);
      },
    },
  })(req, res);
}
