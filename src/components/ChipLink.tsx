import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ChipTypeMap } from '@mui/material/Chip/Chip';
import { UrlObject } from 'url';
import Link from 'next/link';

type ChipLinkProps<
  D extends React.ElementType = ChipTypeMap['defaultComponent'],
  P = {},
> = Omit<ChipProps<'a', P>, 'component' | 'href' | 'onClick'> & { href: UrlObject | string };

export const ChipLink: React.FC<ChipLinkProps> = ({ href, ...props }) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <Chip {...props} component="a" />
    </Link>
  );
};
