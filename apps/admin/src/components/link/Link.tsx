'use client';

import { Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import type { AppRoute } from '../../routes';

export interface LinkProps extends Omit<ComponentProps<typeof MuiLink>, 'href'> {
  href: AppRoute;
  children?: ReactNode;
}

export const Link = ({ href, ...props }: LinkProps) => (
  // AppRoute is derived from the generated routes, so it is runtime-valid; only
  // next/link's unresolved generic resolves narrower than the union.
  <MuiLink component={NextLink} href={href as ComponentProps<typeof NextLink>['href']} {...props} />
);
