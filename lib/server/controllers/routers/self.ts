import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import {
  cancelCourseRegistration,
  createUser,
  findCourseRegistrations,
  findCourses,
  findUser,
  findUsers,
  findUserUpdate,
  updateUser
} from '../../services';
import { userCreateSchema, userUpdateSchema } from '../../../common/newSchemas/user';

// It is important to control the data that we return from this router, since it is accessible to any logged-in user

export const selfRouter = trpc
  .router<ContextProtected>()
  .query('findAllRegisteredCourses', {
    input: z.strictObject({
      future: z.boolean().nullable(),
    }),
    resolve: async ({ input: { future } }) => {
      const whereCourseFuture = {
          dateEnd: {
            gt: new Date(),
          },
      };
      return findCourseRegistrations({
        where: {
          isUserCanceled: false,
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
    resolve: async ({ input: { id } }) => cancelCourseRegistration({ data: { id } }).then(({ id }) => ({ id })),
  });
