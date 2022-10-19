import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { findCourseModels } from '../../services';

export const courseModelRouter = trpc
  .router<ContextProtected>()
  .query('getAll', {
    resolve: async () => findCourseModels(),
  });
