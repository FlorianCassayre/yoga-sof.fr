import React from 'react';
import { Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';

interface BackofficeContentProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const BackofficeContent: React.FC<BackofficeContentProps> = ({ title, icon, children }) => {
  return (
    <>
      <Stack direction="row" alignItems="center" gap={1} component={'div'}>
        {icon}
        <Typography variant="h5">{title}</Typography>
      </Stack>
      <Divider sx={{ mt: 1, mb: 3 }} />
      <main>
        {children}
      </main>
    </>
  );
}
