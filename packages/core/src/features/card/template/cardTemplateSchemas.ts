import { z } from 'zod';

import { createSelectByIdSchema } from '../../../db/schemaFactory';
import { eurosToCents, priceSchema } from '../../../util/currency';
import { createListSchema } from '../../../util/list';
import { courseTypeEnum } from '../../course/type/courseTypeEnum';
import { cardTemplatesTable } from './cardTemplatesTable';

export const cardTemplateListSchema = createListSchema<typeof cardTemplatesTable>({
  type: true,
  price: true,
  count: true,
});

export const cardTemplateGetSchema = createSelectByIdSchema(cardTemplatesTable);

export const cardTemplateCreateSchema = z.object({
  type: z.enum(courseTypeEnum.enumValues),
  price: priceSchema.transform(eurosToCents),
  count: z.coerce.number().int().min(1, 'Le nombre de séances doit être positif.'),
});

export const cardTemplateEditSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
  type: z.enum(courseTypeEnum.enumValues).optional(),
  price: priceSchema.transform(eurosToCents).optional(),
  count: z.coerce.number().int().min(1, 'Le nombre de séances doit être positif.').optional(),
});

export const cardTemplateDeleteSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
});
