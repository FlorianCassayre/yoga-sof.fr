import { z } from 'zod';

const priceValue = z.coerce
  .number({ message: 'Le prix est requis.' })
  .min(0, 'Le prix doit être positif.')
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-4,
    'Le prix doit avoir au plus deux décimales.',
  );

// An empty string would coerce to 0, so it is normalized to undefined first.
export const priceInput = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  priceValue,
);
