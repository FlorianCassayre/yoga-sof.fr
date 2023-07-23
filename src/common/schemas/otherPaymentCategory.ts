import { z } from 'zod';

export const otherPaymentCategoryFindSchema = z.object({
  id: z.number().int().min(0),
});

const otherPaymentCategorySchemaBase = z.object({
  name: z.string().nonempty(),
});

export const otherPaymentCategoryCreateSchema = otherPaymentCategorySchemaBase;

export const otherPaymentCategoryUpdateSchema = otherPaymentCategorySchemaBase.merge(otherPaymentCategoryFindSchema);

export const otherPaymentCategoryFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});
