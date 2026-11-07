import { z } from 'zod';

export const cardSettingUpdateSchema = z.object({
  validityMonths: z.coerce.number().int().min(1).max(120),
  version: z.number().int().optional(),
});
