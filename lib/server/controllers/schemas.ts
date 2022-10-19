import { z } from 'zod';

const schemaPagination = z.strictObject({
  page: z.number().int().positive().default(0),
  elementsPerPage: z.number().int().positive().default(20),
});

export const schemaWithPagination = z.strictObject({
  pagination: schemaPagination,
});
