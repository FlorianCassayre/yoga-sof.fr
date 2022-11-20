import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import {
  cancelCourseRegistration,
  findCourseRegistrations, findUserUpdate,
  updateUser
} from '../../services';
import { prisma } from '../../prisma';

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
  .mutation('cancelRegistration', {
    input: z.strictObject({
      id: z.number().int().min(0),
    }),
    resolve: async ({ input: { id }, ctx: { session: { userId } } }) => {
      await prisma.$transaction(async () => {
        await prisma.courseRegistration.findFirstOrThrow({ where: { id, userId } }); // Access control
        cancelCourseRegistration({ where: { id } }).then(({ id }) => ({ id }));
      });
      return { id };
    },
  })
  .query('profile', {
    resolve: async ({ ctx: { session: { userId } } }) => {
      const { name, email } = await findUserUpdate({ where: { id: userId } });
      return { name, email };
    },
  })
  .mutation('updateProfile', {
    input: z.strictObject({
      name: z.string().min(1),
      email: z.string().email().nullable(),
    }),
    resolve: async ({ input: { name, email }, ctx: { session: { userId } } }) => {
      await updateUser({ where: { id: userId }, data: { name, email } });
    },
  });
