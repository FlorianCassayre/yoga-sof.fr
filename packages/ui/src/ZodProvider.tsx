'use client';

import { type ReactNode, useEffect } from 'react';
import type { ZodErrorMap } from 'zod';
import { z } from 'zod';
import { fr } from 'zod/locales';

const zodErrorMap: ZodErrorMap = (issue) => {
  const { code, expected, input, origin, minimum } = issue;

  if (
    (code === 'invalid_type' && expected === 'string' && !input) ||
    (code === 'too_small' && origin === 'string' && minimum === 1)
  ) {
    return 'Champ requis.';
  }

  return undefined;
};

interface ZodProviderProps {
  children: ReactNode;
}

export const ZodProvider = ({ children }: ZodProviderProps) => {
  useEffect(() => {
    z.config({ ...fr(), customError: zodErrorMap });
  }, []);

  return children;
};
