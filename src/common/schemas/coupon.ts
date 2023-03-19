import { z } from 'zod';
import { CourseType } from '@prisma/client';

export const couponFindSchema = z.object({
  id: z.number().int().min(0),
});

export const couponCreateSchema = z.object({
  couponModelId: z.number().int().min(0),
  userId: z.number().int().min(0).optional(),
});
