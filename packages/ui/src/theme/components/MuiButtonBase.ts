import type { Components } from '@mui/material';
import NextLink from 'next/link';

export const MuiButtonBase: Components['MuiButtonBase'] = {
  defaultProps: {
    LinkComponent: NextLink,
  },
};
