import React from 'react';
import { Typography } from '@mui/material';
import { HeadMeta } from '../HeadMeta';

interface FrontsiteContentProps {
  title: string;
  hideTitleMeta?: boolean;
  hideTitle?: boolean;
  children: React.ReactNode;
}

export const FrontsiteContent: React.FC<FrontsiteContentProps> = ({ title, hideTitleMeta, hideTitle, children }) => {
  const subtitle = `Yoga Sof Hésingue`;
  return (
    <>
      <HeadMeta title={hideTitleMeta ? subtitle : `${title} · ${subtitle}`} />
      {title && !hideTitle && (
        <Typography variant="h4">{title}</Typography>
      )}
      {children}
    </>
  );
}
