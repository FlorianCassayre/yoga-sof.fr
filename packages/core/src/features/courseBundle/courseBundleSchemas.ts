import { z } from 'zod';

import { createSelectByIdSchema, createVersionedUpdateSchema } from '../../db/schemaFactory';
import { eurosToCents, priceSchema } from '../../util/currency';
import { listSchema, sortSchema } from '../../util/list';
import { courseBundlesTable } from './courseBundlesTable';

export const courseBundleListSchema = listSchema.extend({
  sort: sortSchema({
    label: true,
    price: true,
    type: true,
  }),
  courseSuperBundleId: z.coerce.number().int().optional(),
});

export const courseBundleGetSchema = createSelectByIdSchema(courseBundlesTable);

export const courseBundleEditSchema = createVersionedUpdateSchema(courseBundlesTable).extend({
  price: priceSchema.transform(eurosToCents).optional(),
  capacity: z
    .preprocess(
      (value) => (value === '' || value === null ? undefined : value),
      z.coerce.number().int().min(0),
    )
    .optional(),
});
