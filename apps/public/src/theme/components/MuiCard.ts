import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';

export const MuiCard: Components['MuiCard'] = {
  styleOverrides: {
    root: {
      borderRadius: 24,
      border: `1px solid ${NATURAL_PALETTE.border}`,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    },
  },
};
