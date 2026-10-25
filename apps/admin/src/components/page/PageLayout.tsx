'use client';

import { Divider, Stack, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { PageActionGroup } from './PageAction';
import { PageActionsMenu } from './PageActionsMenu';
import { PageFab } from './PageFab';

interface PageLayoutProps {
  icon: LucideIcon;
  title: string;
  actions?: PageActionGroup[];
  children: ReactNode;
}

export const PageLayout = ({ icon: Icon, title, actions, children }: PageLayoutProps) => {
  const groups = actions ?? [];
  const fabActions = groups.flatMap((group) => group.children.filter((action) => action.fab));

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Icon size={24} />
          <Typography variant="h5">{title}</Typography>
        </Stack>
        <PageActionsMenu actions={groups} />
      </Stack>
      <Divider />
      {children}
      <PageFab actions={fabActions} label={title} />
    </Stack>
  );
};
