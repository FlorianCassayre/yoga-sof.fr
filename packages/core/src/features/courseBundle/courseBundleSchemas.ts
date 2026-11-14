import { z } from 'zod';

import { createSelectByIdSchema, createVersionedUpdateSchema } from '../../db/schemaFactory';
import { eurosToCents, priceSchema } from '../../util/currency';
import { listSchema, sortSchema } from '../../util/list';
import { courseTypeEnum } from '../course/type/courseTypeEnum';
import { courseBundlesTable } from './courseBundlesTable';

export const courseBundleListSchema = listSchema.extend({
  sort: sortSchema({
    label: true,
    price: true,
    type: true,
  }),
});

export const courseBundleGetSchema = createSelectByIdSchema(courseBundlesTable);

export const courseBundleCreateSchema = z.object({
  label: z.string().trim().min(1, 'Le libellé est requis.'),
  type: z.enum(courseTypeEnum.enumValues),
  price: priceSchema.transform(eurosToCents),
  capacity: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(0),
  ),
});

export const courseBundleEditSchema = createVersionedUpdateSchema(courseBundlesTable).extend({
  price: priceSchema.transform(eurosToCents).optional(),
  capacity: z
    .preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(0),
    )
    .optional(),
});
