import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';

export const MuiDrawer: Components['MuiDrawer'] = {
  styleOverrides: {
    paper: {
      backgroundColor: NATURAL_PALETTE.canvas,
    },
  },
};
