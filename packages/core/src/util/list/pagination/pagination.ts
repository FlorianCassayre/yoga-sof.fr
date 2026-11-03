import type { z } from 'zod';

import type { listSchema } from './listSchema';

export interface Pagination {
  limit: number;
  offset: number;
}

export const pagination = ({
  page,
  pageSize,
}: Pick<z.infer<typeof listSchema>, 'page' | 'pageSize'>): Pagination => ({
  limit: pageSize,
  offset: page * pageSize,
});
