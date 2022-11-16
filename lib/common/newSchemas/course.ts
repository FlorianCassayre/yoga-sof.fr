import { z } from 'zod';

export const courseFindSchema = z.object({
  id: z.number().int().min(0),
});

export const courseUpdateSchema = z.object({
  price: z.number().int().min(0),
  slots: z.number().int().min(0),
}).merge(courseFindSchema);

export const courseCreateSchema = courseUpdateSchema; // FIXME

export const courseFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});

export const courseUpdateNotesSchema = z.object({
  notes: z.string().nullable(),
}).merge(courseFindSchema);
