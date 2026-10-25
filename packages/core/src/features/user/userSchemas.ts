import { z } from 'zod';

import { createListSchema, type SortableColumns } from '../../list';
import type { usersTable } from '../auth/tables';

const SORTABLE_COLUMNS = {
  email: true,
  emailVerified: true,
  name: true,
} as const satisfies SortableColumns<typeof usersTable>;

export const userListSchema = createListSchema(SORTABLE_COLUMNS);

export const userGetSchema = z.object({
  id: z.uuid(),
});
