import type { Components } from '@mui/material';

export const MuiCard: Components['MuiCard'] = {
  styleOverrides: {
    root: {
      '& .MuiTable-root .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
  },
};
