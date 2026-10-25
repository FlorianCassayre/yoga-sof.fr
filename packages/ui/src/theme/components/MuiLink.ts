import type { Components } from '@mui/material';
import NextLink from 'next/link';

export const MuiLink: Components['MuiLink'] = {
  defaultProps: {
    component: NextLink,
  },
};
