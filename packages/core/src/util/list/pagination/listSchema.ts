import { z } from 'zod';

export const listSchema = z.object({
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  search: z.string().trim().min(1).max(100).optional(),
});
