import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { UrlObject } from 'url';
import { grey } from '@mui/material/colors';

interface RichLinkProps {
  url: string | UrlObject;
  icon?: JSX.Element;
  children: React.ReactNode;
}

export const RichLink: React.FunctionComponent<RichLinkProps> = ({ url, icon, children }) => {
  return (
    <Link href={url} passHref>
      <Stack direction="row" spacing={1} alignItems="center" component="a" sx={{ color: grey[600] }}>
        {icon}
        <span style={{ color: grey[900] }}>{children}</span>
      </Stack>
    </Link>
  );
};
