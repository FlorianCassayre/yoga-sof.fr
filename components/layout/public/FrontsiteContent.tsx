import React from 'react';
import { Typography } from '@mui/material';
import { HeadMeta } from '../HeadMeta';

interface FrontsiteContentProps {
  title: string;
  hideTitle?: boolean;
  children: React.ReactNode;
}

export const FrontsiteContent: React.FC<FrontsiteContentProps> = ({ title, hideTitle, children }) => {
  return (
    <>
      <HeadMeta title={`${title} · Yoga Sof`} />
      {title && !hideTitle && (
        <Typography variant="h4">{title}</Typography>
      )}
      {children}
    </>
  );
}
