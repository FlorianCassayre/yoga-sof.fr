import { z } from 'zod';

export const idSchema = z.number().int().min(0);

export const nonEmptyUniqueIdsSchema = z.array(idSchema).nonempty()
  .refine(array => new Set(array).size === array.length, { message: `Les éléments doivent être distincts` });
