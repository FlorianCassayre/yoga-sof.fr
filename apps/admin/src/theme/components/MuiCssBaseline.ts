import { alpha, type Components, type Theme } from '@mui/material';

export const MuiCssBaseline: Components['MuiCssBaseline'] = {
  styleOverrides: (theme) => {
    const { palette } = theme as Theme;

    return {
      '[data-email-message] a': {
        color: palette.primary.main,
        textDecorationColor: alpha(palette.primary.main, 0.4),
        '&:hover': { textDecorationColor: palette.primary.main },
      },
    };
  },
};
