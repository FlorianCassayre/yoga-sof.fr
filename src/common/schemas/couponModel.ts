import { z } from 'zod';
import { CourseType } from '@prisma/client';

const couponModelSchemaBase = z.object({
  courseType: z.nativeEnum(CourseType),
  quantity: z.number().int().min(1).max(99),
  price: z.number().int().min(0).max(999),
});

export const couponModelFindSchema = z.object({
  id: z.number().int().min(0),
});

export const couponModelUpdateSchema = couponModelSchemaBase.merge(couponModelFindSchema);

export const couponModelCreateSchema = couponModelSchemaBase;

export const couponModelGetTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
