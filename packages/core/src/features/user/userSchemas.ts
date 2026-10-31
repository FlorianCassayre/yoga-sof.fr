import { z } from 'zod';

import { createListSchema } from '../../util/list';
import type { usersTable } from '../auth/authTables';

export const userListSchema = createListSchema<typeof usersTable>({
  email: true,
  emailVerified: true,
  name: true,
});

export const userGetSchema = z.object({
  id: z.uuid(),
});
