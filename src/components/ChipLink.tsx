import React from 'react';
import { useRouter } from 'next/router';
import { Chip, ChipProps } from '@mui/material';
import { ChipTypeMap } from '@mui/material/Chip/Chip';

type ChipLinkProps<
  D extends React.ElementType = ChipTypeMap['defaultComponent'],
  P = {},
> = Omit<ChipProps<D, P>, 'onClick'> & { href: string };

export const ChipLink: React.FC<ChipLinkProps> = ({ href, ...props }) => {
  const router = useRouter();
  return (
    <Chip {...props} onClick={() => router.push(href)} />
  );
};
