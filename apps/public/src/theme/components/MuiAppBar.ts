import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';

export const MuiAppBar: Components['MuiAppBar'] = {
  styleOverrides: {
    root: {
      backgroundColor: 'rgba(253, 252, 248, 0.9)',
      backdropFilter: 'blur(12px)',
      color: NATURAL_PALETTE.forest,
    },
  },
};
