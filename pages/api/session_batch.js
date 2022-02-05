import { USER_TYPE_ADMIN } from '../../components';
import { schemaSessionBatchBody } from '../../lib/common';
import { apiHandler } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaSessionBatchBody,
      action: async (req, res, { accept, body: { type, slots, price, dates } }) => {
        const records = dates.map(([start, end]) => ({
          type,
          slots,
          price,
          date_start: new Date(start),
          date_end: new Date(end),
        }));
        await prisma.sessions.createMany({
          data: records,
        });

        accept({});
      }
    }
  })(req, res);
}
