import { z } from 'zod';

export const membershipSettingUpdateSchema = z.object({
  seasonStartMonth: z.number().int().min(1).max(12),
  version: z.number().int().optional(),
});
