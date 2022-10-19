import React from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';

interface SpeedDialActionItem {
  icon: JSX.Element;
  name: string;
  onClick?: () => void;
}

interface BasicSpeedDialProps {
  actions: SpeedDialActionItem[];
}

export const BasicSpeedDial: React.FC<BasicSpeedDialProps> = ({ actions }) => {
  const margin = { xs: 16, md: 32 };
  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: 'absolute', bottom: margin, right: margin }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => action.onClick && action.onClick()}
        />
      ))}
    </SpeedDial>
  );
};
