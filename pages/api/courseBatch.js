import { USER_TYPE_ADMIN, schemaCourseBatchBody } from '../../lib/common';
import { apiHandler, prisma } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaCourseBatchBody,
      action: async ({ accept, body: { type, slots, price, dates } }) => {
        const records = dates.map(([start, end]) => ({
          type,
          slots,
          price,
          dateStart: new Date(start),
          dateEnd: new Date(end),
        }));
        await prisma.course.createMany({ data: records });

        accept({});
      },
    },
  })(req, res);
}
