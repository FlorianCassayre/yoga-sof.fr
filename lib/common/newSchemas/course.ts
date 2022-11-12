import { z } from 'zod';

const courseSchemaBase = z.object({

});

export const courseFindSchema = z.object({
  id: z.number().int().min(0),
});

export const courseUpdateSchema = courseSchemaBase.merge(courseFindSchema);

export const courseCreateSchema = courseSchemaBase;

export const courseFindTransformSchema = z.object({
  id: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
});

export const courseUpdateNotesSchema = z.object({
  notes: z.string().nullable(),
}).merge(courseFindSchema);
