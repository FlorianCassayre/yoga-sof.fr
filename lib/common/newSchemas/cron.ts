import { z } from 'zod';

export const cronExecuteSchema = z.strictObject({
  token: z.string(),
});
