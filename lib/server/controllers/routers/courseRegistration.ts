import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { findCourseRegistrations } from '../../services';

export const courseRegistrationRouter = trpc
  .router<ContextProtected>()
  .query('findAll', {
    resolve: async () => findCourseRegistrations({ include: { user: true } }),
  });
