import React from 'react';
import { Link as MuiLink } from '@mui/material';
import Link from 'next/link';

export const InternalLink: React.FC<Pick<Parameters<typeof Link>[0], 'href' | 'children'> & Parameters<typeof MuiLink>[0]> =
  ({ href, children, ...rest }) => {
    return (
      <Link href={href} passHref><MuiLink {...rest}>{children}</MuiLink></Link>
    );
  };