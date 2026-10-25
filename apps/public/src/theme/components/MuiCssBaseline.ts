import type { Components } from '@mui/material';

import { NATURAL_PALETTE } from '../palette';
import { fontPrimary } from '../typography';

export const MuiCssBaseline: Components['MuiCssBaseline'] = {
  styleOverrides: {
    body: {
      backgroundColor: NATURAL_PALETTE.canvas,
      color: NATURAL_PALETTE.forest,
      fontFamily: fontPrimary,
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
};
