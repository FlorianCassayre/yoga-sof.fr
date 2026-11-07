import { z } from 'zod';

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Champ requis.');
