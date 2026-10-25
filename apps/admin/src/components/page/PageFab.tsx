'use client';

import type { SxProps, Theme } from '@mui/material';
import { Fab, Link, SpeedDial, SpeedDialAction } from '@mui/material';
import { Plus } from 'lucide-react';

import type { PageAction } from './PageAction';

const fabPosition: SxProps<Theme> = { position: 'fixed', bottom: 24, right: 24 };

interface PageFabProps {
  actions: PageAction[];
  label: string;
}

export const PageFab = ({ actions, label }: PageFabProps) => {
  const [action] = actions.length === 1 ? actions : [];

  if (!action && actions.length < 2) {
    return null;
  }

  if (!action) {
    return (
      <SpeedDial ariaLabel={label} sx={fabPosition} icon={<Plus size={22} />}>
        {actions.map((fabAction) => {
          const ActionIcon = fabAction.icon;
          return (
            <SpeedDialAction
              key={fabAction.label}
              icon={ActionIcon ? <ActionIcon size={20} /> : <Plus size={20} />}
              slotProps={{
                fab: { component: Link, href: fabAction.href },
                tooltip: { title: fabAction.label },
              }}
            />
          );
        })}
      </SpeedDial>
    );
  }

  const FabIcon = action.icon ?? Plus;
  const fabProps = action.href
    ? { component: Link, href: action.href }
    : { onClick: action.onClick };

  return (
    <Fab color="primary" {...fabProps} sx={fabPosition}>
      <FabIcon size={22} />
    </Fab>
  );
};
