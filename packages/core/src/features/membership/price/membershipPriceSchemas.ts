import { z } from 'zod';

import { createSelectByIdSchema } from '../../../db/schemaFactory';
import { eurosToCents, priceInput } from '../../../util/currency';
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
