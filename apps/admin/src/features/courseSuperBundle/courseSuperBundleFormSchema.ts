import { courseTypeEnum, priceSchema } from '@yoga-sof/core';
import { z } from 'zod';

// Mirrors the server courseSuperBundleCreateSchema: the required row fields
// fail with the shared French messages, so no superRefine is needed.
export const courseSuperBundleFormSchema = z.object({
  label: z.string().trim().min(1, 'Le libellé est requis.'),
  price: priceSchema,
  bundles: z.array(
    z.object({
      label: z.string().trim().min(1, 'Le libellé est requis.'),
      type: z.preprocess(
        (value) => (value === null ? undefined : value),
        z.enum(courseTypeEnum.enumValues, { message: 'Le type est requis.' }),
      ),
      price: priceSchema,
      capacity: z.preprocess(
        (value) => (value === '' || value === null ? undefined : value),
        z.coerce.number({ message: 'La capacité est requise.' }).int().min(0),
      ),
    }),
  ),
});
