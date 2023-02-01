import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { BasicSpeedDial } from '../../BasicSpeedDial';
import { BackofficeContentBase } from './BackofficeContentBase';
import { MoreActionsButton } from '../../MoreActionsButton';

interface BackofficeContentProps {
  titleRaw?: string;
  title: React.ReactElement | string;
  icon: React.ReactNode;
  actions?: Parameters<typeof BasicSpeedDial>[0]['actions'];
  quickActions?: Parameters<typeof BasicSpeedDial>[0]['actions'];
  children: React.ReactNode;
}

export const BackofficeContent: React.FC<BackofficeContentProps> = ({ titleRaw, title, icon, actions, quickActions, children }) => {
  return (
    <BackofficeContentBase title={titleRaw ?? String(title)}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" component="div" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1} component="div">
            {icon}
            <Typography variant="h5">{title}</Typography>
          </Stack>
          {actions && actions.length > 0 && (
            <MoreActionsButton actions={actions} />
          )}
        </Stack>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <main>
          {children}
        </main>
        {quickActions && quickActions.length > 0 && (
          <BasicSpeedDial actions={quickActions} />
        )}
      </Box>
    </BackofficeContentBase>
  );
}
