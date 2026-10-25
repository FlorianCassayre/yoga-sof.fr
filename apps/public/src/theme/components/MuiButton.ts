import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';

export const MuiButton: Components['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      borderRadius: 9999,
      padding: '10px 24px',
    },
    contained: {
      '&:hover': {
        boxShadow: '0 4px 14px rgba(127, 147, 80, 0.3)',
      },
    },
    outlined: {
      backgroundColor: '#FFFFFF',
      '&:hover': {
        borderColor: NATURAL_PALETTE.moss,
        backgroundColor: NATURAL_PALETTE.surfaceHighlight,
      },
    },
  },
};
