import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';

export const MuiDialog: Components['MuiDialog'] = {
  styleOverrides: {
    paper: {
      borderRadius: 24,
      border: `1px solid ${NATURAL_PALETTE.border}`,
    },
  },
};
