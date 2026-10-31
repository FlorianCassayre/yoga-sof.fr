import { z } from 'zod';

import { createSelectByIdSchema } from '../../../db/schemaFactory';
import { eurosToCents } from '../../../util/currency';
import { createListSchema } from '../../../util/list';
import { membershipTypeEnum } from '../type/membershipTypeEnum';
import { membershipPricesTable } from './membershipPricesTable';

const priceValue = z.coerce
  .number({ message: 'Le prix est requis.' })
  .min(0, 'Le prix doit être positif.')
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-4,
    'Le prix doit avoir au plus deux décimales.',
  );

// An empty string would coerce to 0, so it is normalized to undefined first.
const priceInput = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  priceValue,
);

export const membershipPriceListSchema = createListSchema<typeof membershipPricesTable>({
  price: true,
  type: true,
});

export const membershipPriceGetSchema = createSelectByIdSchema(membershipPricesTable);

export const membershipPriceCreateSchema = z.object({
  type: z.enum(membershipTypeEnum.enumValues),
  price: priceInput.transform(eurosToCents),
});

export const membershipPriceEditSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
  type: z.enum(membershipTypeEnum.enumValues).optional(),
  price: priceInput.transform(eurosToCents).optional(),
});

export const membershipPriceDeleteSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
});
