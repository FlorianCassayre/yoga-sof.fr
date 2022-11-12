import React from 'react';
import { Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { BasicSpeedDial } from '../../BasicSpeedDial';
import { HeadMeta } from '../HeadMeta';

interface BackofficeContentProps {
  title: React.ReactElement | string;
  icon: React.ReactNode;
  actions?: Parameters<typeof BasicSpeedDial>[0]['actions'];
  children: React.ReactNode;
}

export const BackofficeContent: React.FC<BackofficeContentProps> = ({ title, icon, actions, children }) => {
  return (
    <>
      <HeadMeta title={`${title} · Yoga Sof`} />
      <Stack direction="row" alignItems="center" gap={1} component={'div'}>
        {icon}
        <Typography variant="h5">{title}</Typography>
      </Stack>
      <Divider sx={{ mt: 1, mb: 2 }} />
      <main>
        {children}
      </main>
      {actions && (
        <BasicSpeedDial actions={actions} />
      )}
    </>
  );
}
