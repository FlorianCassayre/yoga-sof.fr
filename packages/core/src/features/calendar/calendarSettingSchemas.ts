import { z } from 'zod';

const hourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):00$/, 'L’horaire doit être exprimé en heures entières.')
  .transform((value) => `${value}:00`);

export const calendarSettingUpdateSchema = z.object({
  dayStartsAt: hourSchema,
  dayEndsAt: hourSchema,
  version: z.number().int().optional(),
});
