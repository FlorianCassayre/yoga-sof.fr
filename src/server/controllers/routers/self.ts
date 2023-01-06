import { z } from 'zod';
import {
  cancelCourseRegistration, createCourseRegistrations,
  findCourseRegistrations, findUserUpdate,
  updateUser
} from '../../services';
import { prisma } from '../../prisma';
import { userSchemaBase } from '../../../common/schemas/user';
import { frontsiteCourseRegistrationSchema } from '../../../common/schemas/frontsiteCourseRegistration';
import { router, userProcedure } from '../trpc';

// It is important to control the data that we return from this router, since it is accessible to any logged-in user

export const selfRouter = router({
  findAllRegisteredCourses: userProcedure
    .input(z.strictObject({
      userCanceled: z.boolean(),
      future: z.boolean().nullable(),
    }))
    .query(async ({ input: { future, userCanceled }, ctx: { session: { userId } } }) => {
      const whereCourseFuture = {
        dateEnd: {
          gt: new Date(),
        },
      };
      return findCourseRegistrations({
        where: {
          userId,
          isUserCanceled: userCanceled,
          course: future == null ? {} : future ? whereCourseFuture : { NOT: whereCourseFuture },
        },
        select: {
          id: true,
          isUserCanceled: true,
          createdAt: true,
          canceledAt: true,
          course: {
            select: {
              id: true,
              type: true,
              dateStart: true,
              dateEnd: true,
              isCanceled: true,
            },
          },
        },
      });
    }),
  profile: userProcedure
    .query(async ({ ctx: { session: { userId } } }) => {
      const { name, email } = await findUserUpdate({ where: { id: userId } });
      return { name, email };
    }),
  cancelRegistration: userProcedure
    .input(z.strictObject({
      id: z.number().int().min(0),
    }))
    .mutation(async ({ input: { id }, ctx: { session: { userId } } }) => {
      await prisma.$transaction(async () => {
        await prisma.courseRegistration.findFirstOrThrow({ where: { id, userId } }); // Access control
        await cancelCourseRegistration({ where: { id } }).then(({ id }) => ({ id }));
      });
      return { id };
    }),
  updateProfile: userProcedure
    .input(userSchemaBase)
    .mutation(async ({ input: { name, email }, ctx: { session: { userId } } }) => {
      await updateUser({ where: { id: userId }, data: { name, email } });
    }),
  register: userProcedure
    .input(frontsiteCourseRegistrationSchema)
    .mutation(async ({ input: { courseIds, notify, name, email }, ctx: { session: { userId } } }) => {
      await prisma.$transaction(async () => {
        await createCourseRegistrations({ data: { users: [userId], courses: courseIds, notify } });
        await updateUser({ where: { id: userId }, data: { name, email } });
      });
    }),
});
