import React from 'react';
import { Link as MuiLink } from '@mui/material';
import Link from 'next/link';

export const InternalLink: React.FC<Pick<Parameters<typeof Link>[0], 'href' | 'children'> & Parameters<typeof MuiLink>[0]> =
  ({ href, children, ...rest }) => (
    <Link href={href} passHref legacyBehavior><MuiLink {...rest}>{children}</MuiLink></Link>
  );
