'use client';

import { type ReactNode, useEffect } from 'react';

import { configureZod } from './configureZod';

interface ZodProviderProps {
  children: ReactNode;
}

export const ZodProvider = ({ children }: ZodProviderProps) => {
  useEffect(() => {
    configureZod();
  }, []);

  return children;
};
