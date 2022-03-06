import { apiHandler, prisma } from '../../lib/server';

export default async function handler(req, res) {
  await apiHandler({
    GET: {
      action: async ({ accept }) => {
        // Not atomic, but it does not really matter since both tables are independent
        const [courseModels, futureCourses] = await Promise.all([
          prisma.courseModel.findMany(),
          prisma.course.findMany({
            select: {
              id: true,
              type: true,
              slots: true,
              price: true,
              dateStart: true,
              dateEnd: true,
              registrations: {
                where: { isUserCanceled: false },
                select: { isUserCanceled: true },
              },
            },
            where: {
              AND: [
                { isCanceled: false },
                { dateStart: { gt: new Date() } },
              ],
            },
          }),
        ]);

        // Convert array into count
        // Follow https://github.com/prisma/prisma/issues/6570 for better alternative

        accept({ schedule: courseModels, courses: futureCourses.map(({ registrations, ...obj }) => ({ ...obj, registrations: registrations.length })) });
      },
    },
  })(req, res);
}
