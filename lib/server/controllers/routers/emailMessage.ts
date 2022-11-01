import * as trpc from '@trpc/server';
import { ContextProtected } from '../context';
import { z } from 'zod';
import { findEmailMessages } from '../../services';

export const emailMessageRouter = trpc
  .router<ContextProtected>()
  .query('findAll', {
    resolve: async () => findEmailMessages(),
  });
