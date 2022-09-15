import { z } from 'zod';

export const updateServerSchema = z.strictObject({
  token: z.string(),
});
