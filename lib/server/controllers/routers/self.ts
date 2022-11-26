import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import {
  cancelCourseRegistration, createCourseRegistrations,
  findCourseRegistrations, findUserUpdate,
  updateUser
} from '../../services';
import { prisma } from '../../prisma';
import { userSchemaBase } from '../../../common/newSchemas/user';
import { frontsiteCourseRegistrationSchema } from '../../../common/newSchemas/frontsiteCourseRegistration';

// It is important to control the data that we return from this router, since it is accessible to any logged-in user

export const selfRouter = trpc
  .router<ContextProtected>()
  .query('findAllRegisteredCourses', {
    input: z.strictObject({
      userCanceled: z.boolean(),
      future: z.boolean().nullable(),
    }),
    resolve: async ({ input: { future, userCanceled } }) => {
      const whereCourseFuture = {
          dateEnd: {
            gt: new Date(),
          },
      };
      return findCourseRegistrations({
        where: {
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
    },
  })
  .query('profile', {
    resolve: async ({ ctx: { session: { userId } } }) => {
      const { name, email } = await findUserUpdate({ where: { id: userId } });
      return { name, email };
    },
  })
  .mutation('cancelRegistration', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id }, ctx: { session: { userId } } }) => {
      await prisma.$transaction(async () => {
        await prisma.courseRegistration.findFirstOrThrow({ where: { id, userId } }); // Access control
        await cancelCourseRegistration({ where: { id } }).then(({ id }) => ({ id }));
      });
      return { id };
    },
  })
  .mutation('updateProfile', {
    input: userSchemaBase,
    resolve: async ({ input: { name, email }, ctx: { session: { userId } } }) => {
      await updateUser({ where: { id: userId }, data: { name, email } });
    },
  })
  .mutation('register', {
    input: frontsiteCourseRegistrationSchema,
    resolve: async ({ input: { courseIds, notify, name, email }, ctx: { session: { userId } } }) => {
      await prisma.$transaction(async () => {
        await createCourseRegistrations({ data: { users: [userId], courses: courseIds, notify } });
        await updateUser({ where: { id: userId }, data: { name, email } });
      });
    },
  });
