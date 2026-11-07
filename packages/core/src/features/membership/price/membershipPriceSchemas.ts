import { z } from 'zod';

import { createSelectByIdSchema } from '../../../db/schemaFactory';
import { eurosToCents, priceSchema } from '../../../util/currency';
import { createListSchema } from '../../../util/list';
import { membershipTypeEnum } from '../type/membershipTypeEnum';
import { membershipPricesTable } from './membershipPricesTable';

export const membershipPriceListSchema = createListSchema<typeof membershipPricesTable>({
  price: true,
  type: true,
});

export const membershipPriceGetSchema = createSelectByIdSchema(membershipPricesTable);

export const membershipPriceCreateSchema = z.object({
  type: z.enum(membershipTypeEnum.enumValues),
  price: priceSchema.transform(eurosToCents),
});

export const membershipPriceEditSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
  type: z.enum(membershipTypeEnum.enumValues).optional(),
  price: priceSchema.transform(eurosToCents).optional(),
});

export const membershipPriceDeleteSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
});
