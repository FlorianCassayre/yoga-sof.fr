import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource-variable/cormorant';

import { createTheme, type ThemeOptions } from '@mui/material';
import { muiFrenchLocale } from '@yoga-sof/ui/muiFrenchLocale';
import { theme as baseTheme } from '@yoga-sof/ui/theme/theme';

import { MuiAppBar } from './components/MuiAppBar';
import { MuiButton } from './components/MuiButton';
import { MuiCard } from './components/MuiCard';
import { MuiChip } from './components/MuiChip';
import { MuiCssBaseline } from './components/MuiCssBaseline';
import { MuiDataGrid } from './components/MuiDataGrid';
import { MuiDialog } from './components/MuiDialog';
import { MuiDrawer } from './components/MuiDrawer';
import { MuiPaper } from './components/MuiPaper';
import { palette } from './palette';
import { typography } from './typography';

const themeOptions: ThemeOptions = {
  typography,
  palette,
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiAppBar,
    MuiButton,
    MuiCard,
    MuiChip,
    MuiCssBaseline,
    MuiDataGrid,
    MuiDialog,
    MuiDrawer,
    MuiPaper,
  },
};

export const theme = createTheme(themeOptions, baseTheme, muiFrenchLocale);
