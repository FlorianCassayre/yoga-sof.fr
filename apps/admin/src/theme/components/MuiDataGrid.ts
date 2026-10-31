import '@mui/x-data-grid/themeAugmentation';

import type { Components } from '@mui/material';

export const MuiDataGrid: Components['MuiDataGrid'] = {
  defaultProps: {
    autoHeight: true,
    disableRowSelectionOnClick: true,
    disableColumnMenu: true,
    disableColumnResize: true,
    paginationMode: 'server',
    sortingMode: 'server',
    sortingOrder: ['asc', 'desc'],
    pageSizeOptions: [10, 20, 50],
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
