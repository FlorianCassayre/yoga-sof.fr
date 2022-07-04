import { USER_TYPE_ADMIN, schemaCourseBatchBody } from '../../lib/common';
import { apiHandler, prisma } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    POST: {
      permissions: [USER_TYPE_ADMIN],
      schemaBody: schemaCourseBatchBody,
      action: async ({ accept, body: { type, slots, price, dates, bundle, bundleName } }) => {
        const records = dates.map(([start, end]) => ({
          type,
          slots,
          price: bundle ? 0 : price, // Price is 0 here if it is a bundle
          dateStart: new Date(start),
          dateEnd: new Date(end),
        }));
        if (!bundle) {
          await prisma.course.createMany({ data: records });
        } else {
          await prisma.courseBundle.create({
            data: {
              name: bundleName,
              price,
              courses: {
                create: records,
              },
            },
          });
        }

        accept({});
      },
    },
  })(req, res);
}
