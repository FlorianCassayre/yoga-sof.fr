import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';

export const cardListSchema = listSchema
  .extend({
    sort: sortSchema({
      userName: true,
      type: true,
      price: true,
      remaining: true,
      validUntil: true,
      createdAt: true,
    }),
  })
  .extend({
    userId: z.string().min(1).optional(),
  });

export const cardGetSchema = z.object({
  id: z.coerce.number().int(),
});

// The form values hold the full rows (or null while nothing is selected); a
// preprocess normalizes null to undefined BEFORE validation so a missing
// selection fails with the shared required message instead of a type error.
export const cardCreateSchema = z
  .object({
    holder: z.preprocess(
      (value) => (value === null ? undefined : value),
      z.object({ id: z.string().min(1) }),
    ),
    template: z.preprocess(
      (value) => (value === null ? undefined : value),
      z.object({ id: z.coerce.number().int() }),
    ),
  })
  .transform(({ holder, template }) => ({ userId: holder.id, templateId: template.id }));

export const cardEditSchema = z.object({
  id: z.coerce.number().int(),
  version: z.coerce.number().int(),
  validUntil: z.iso.date('La date de validité est invalide.'),
});

export const cardCancelSchema = z.object({
  id: z.coerce.number().int(),
});
