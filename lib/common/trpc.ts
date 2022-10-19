import { createReactQueryHooks } from '@trpc/react';
import { AppRouter } from '../server/controllers';

export const trpc = createReactQueryHooks<AppRouter>();
