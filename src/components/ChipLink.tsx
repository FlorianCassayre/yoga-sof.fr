import React from 'react';
import { useRouter } from 'next/router';
import { Chip, ChipProps } from '@mui/material';
import { ChipTypeMap } from '@mui/material/Chip/Chip';
import { UrlObject } from 'url';

type ChipLinkProps<
  D extends React.ElementType = ChipTypeMap['defaultComponent'],
  P = {},
> = Omit<ChipProps<D, P>, 'onClick'> & { href: UrlObject | string };

export const ChipLink: React.FC<ChipLinkProps> = ({ href, ...props }) => {
  const router = useRouter();
  return (
    <Chip {...props} onClick={() => router.push(href)} />
  );
};
