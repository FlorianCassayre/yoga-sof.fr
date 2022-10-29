import React from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { useRouter } from 'next/router';

interface SpeedDialActionItem {
  icon: JSX.Element;
  name: string;
  url?: string;
  onClick?: () => void;
}

interface BasicSpeedDialProps {
  actions: SpeedDialActionItem[];
}

export const BasicSpeedDial: React.FC<BasicSpeedDialProps> = ({ actions }) => {
  const margin = { xs: 16, md: 32 };
  const router = useRouter();
  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: 'fixed', bottom: margin, right: margin }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.url && router.push(action.url);
              action.onClick && action.onClick();
            }}
          />
        ))}
    </SpeedDial>
  );
};
