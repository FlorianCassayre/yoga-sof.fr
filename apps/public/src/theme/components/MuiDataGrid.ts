import '@mui/x-data-grid/themeAugmentation';

import type { Components } from '@mui/material';

export const MuiDataGrid: Components['MuiDataGrid'] = {
  defaultProps: {
    disableRowSelectionOnClick: true,
  },
  styleOverrides: {
    root: {
      '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within':
        {
          outline: 'none',
        },
    },
  },
};
