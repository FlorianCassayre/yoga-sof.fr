import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { findCourseRegistrations } from '../../services';
import { z } from 'zod';

export const courseRegistrationRouter = trpc
  .router<ContextProtected>()
  .query('findAll', {
    resolve: async () => findCourseRegistrations({ include: { user: true, course: true } }),
  })
  .query('findAllForUser', {
    input: z.strictObject({
      userId: z.number().int().min(0),
    }),
    resolve: async ({ input: { userId } }) =>
      findCourseRegistrations({ where: { userId }, include: { course: true } })
  })
  .query('findAllForCourse', {
    input: z.strictObject({
      courseId: z.number().int().min(0),
      isActive: z.boolean(),
    }),
    resolve: async ({ input: { courseId, isActive } }) =>
      findCourseRegistrations({ where: { courseId, isUserCanceled: !isActive }, include: { user: true } })
  });
