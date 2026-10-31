import { z, type ZodErrorMap } from 'zod';
import { fr } from 'zod/locales';

const zodErrorMap: ZodErrorMap = (issue) => {
  const { code, input, origin, minimum } = issue;

  if (code === 'invalid_type' && !input) {
    return 'Champ requis.';
  }

  if (code === 'too_small' && origin === 'string' && minimum === 1) {
    return 'Champ requis.';
  }

  return undefined;
};

export const configureZod = () => z.config({ ...fr(), customError: zodErrorMap });
