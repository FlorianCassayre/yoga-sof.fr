import React from 'react';
import { Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { BasicSpeedDial } from '../../BasicSpeedDial';

interface FrontsiteContentProps {
  title: string;
  hideTitle: boolean;
  children: React.ReactNode;
}

export const FrontsiteContent: React.FC<FrontsiteContentProps> = ({ title, hideTitle, children }) => {
  return (
    <>
      <main>
        {title && !hideTitle && (
          <Typography variant="h5">{title}</Typography>
        )}
        {children}
      </main>
    </>
  );
}
