import { z } from 'zod';

export const calendarFindSchema = z.strictObject({
  token: z.string().min(1),
  coach: z.enum(['']).optional(),
});
