import React from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { useRouter } from 'next/router';
import { UrlObject } from 'url';

interface SpeedDialActionItem {
  icon: JSX.Element;
  name: string;
  url?: UrlObject | string;
  onClick?: () => void;
}

interface BasicSpeedDialProps {
  actions: SpeedDialActionItem[];
}

export const BasicSpeedDial: React.FC<BasicSpeedDialProps> = ({ actions }) => {
  const margin = { xs: 16, md: 32 };
  const router = useRouter();
  const height = 32;
  return (
    <Box sx={{ height: { xs: height + 2 * margin.xs, md: height + 2 * margin.md } }}>
      <SpeedDial
        ariaLabel="Actions"
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
    </Box>
  );
};
