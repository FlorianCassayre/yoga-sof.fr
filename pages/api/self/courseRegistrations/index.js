import { ALL_USER_TYPES } from '../../../../lib/common';
import { apiHandler, prisma } from '../../../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      permissions: ALL_USER_TYPES,
      action: async ({ userId, accept }) => {
        const result = await prisma.courseRegistration.findMany({
          where: { userId },
          select: {
            id: true,
            isUserCanceled: true,
            attended: true,
            createdAt: true,
            canceledAt: true,
            course: {
              select: {
                id: true,
                type: true,
                slots: true,
                price: true,
                dateStart: true,
                dateEnd: true,
                isCanceled: true,
              },
            },
          },
        });

        accept(result);
      },
    },
  })(req, res);
}
