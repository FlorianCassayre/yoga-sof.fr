import { createTheme, type ThemeOptions } from '@mui/material';
import { muiFrenchLocale } from '@yoga-sof/ui/muiFrenchLocale';
import { theme as baseTheme } from '@yoga-sof/ui/theme/theme';

import { MuiDataGrid } from './components/MuiDataGrid';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#7F9350',
    },
    background: {
      default: '#FDFCF8',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiDataGrid,
  },
};

export const theme = createTheme(themeOptions, baseTheme, muiFrenchLocale);
