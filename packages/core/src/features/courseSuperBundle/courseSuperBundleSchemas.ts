import { z } from 'zod';

import { createSelectByIdSchema, createVersionedUpdateSchema } from '../../db/schemaFactory';
import { eurosToCents, priceSchema } from '../../util/currency';
import { listSchema, sortSchema } from '../../util/list';
import { courseTypeEnum } from '../course/type/courseTypeEnum';
import { courseSuperBundlesTable } from './courseSuperBundlesTable';

export const courseSuperBundleListSchema = listSchema.extend({
  sort: sortSchema({
    label: true,
    price: true,
  }),
});

export const courseSuperBundleGetSchema = createSelectByIdSchema(courseSuperBundlesTable);

const bundleSchema = z.object({
  label: z.string().trim().min(1, 'Le libellé est requis.'),
  type: z.enum(courseTypeEnum.enumValues),
  price: priceSchema.transform(eurosToCents),
  capacity: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(0),
  ),
});

export const courseSuperBundleCreateSchema = z.object({
  label: z.string().trim().min(1, 'Le libellé est requis.'),
  price: priceSchema.transform(eurosToCents),
  bundles: z.array(bundleSchema),
});

export const courseSuperBundleEditSchema = createVersionedUpdateSchema(
  courseSuperBundlesTable,
).extend({
  price: priceSchema.transform(eurosToCents).optional(),
});
