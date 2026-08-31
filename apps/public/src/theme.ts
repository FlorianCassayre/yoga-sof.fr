import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource-variable/cormorant';

import { alpha, createTheme, type ThemeOptions } from '@mui/material';

export const NATURAL_PALETTE = {
  canvas: '#FDFCF8',
  paper: '#FFFFFF',
  surfaceSubtle: '#F6F5F0',
  surfaceHighlight: '#EDF2E4',
  border: '#E5E4DC',
  borderLight: '#ECEBE4',
  forest: '#2C3022',
  forestDark: '#1E2117',
  sage: '#6B705C',
  sageLight: '#9FA58D',
  moss: '#7F9350',
  mossDark: '#6E8043',
  mossLight: '#98AC67',
  sand: '#D4A373',
  sandLight: '#EAD7C3',
  sandDark: '#B88250',
};

const fontPrimary =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontSecondary = '"Cormorant Variable", Georgia, serif';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: NATURAL_PALETTE.moss,
      dark: NATURAL_PALETTE.mossDark,
      light: NATURAL_PALETTE.mossLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: NATURAL_PALETTE.sage,
      dark: NATURAL_PALETTE.forest,
      light: NATURAL_PALETTE.sageLight,
      contrastText: '#FFFFFF',
    },
    background: {
      default: NATURAL_PALETTE.canvas,
      paper: NATURAL_PALETTE.paper,
    },
    text: {
      primary: NATURAL_PALETTE.forest,
      secondary: NATURAL_PALETTE.sage,
      disabled: NATURAL_PALETTE.sageLight,
    },
    divider: NATURAL_PALETTE.border,
    action: {
      hover: alpha(NATURAL_PALETTE.moss, 0.08),
      selected: alpha(NATURAL_PALETTE.moss, 0.14),
      focus: alpha(NATURAL_PALETTE.moss, 0.12),
    },
  },
  typography: {
    fontFamily: fontPrimary,
    h1: {
      fontFamily: fontSecondary,
      fontWeight: 600,
      color: NATURAL_PALETTE.forest,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: fontSecondary,
      fontWeight: 600,
      color: NATURAL_PALETTE.forest,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: fontSecondary,
      fontWeight: 600,
      color: NATURAL_PALETTE.forest,
      letterSpacing: '-0.01em',
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: fontSecondary,
      fontWeight: 600,
      color: NATURAL_PALETTE.forest,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: fontSecondary,
      fontWeight: 600,
      color: NATURAL_PALETTE.forest,
      lineHeight: 1.35,
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      color: NATURAL_PALETTE.forest,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      color: NATURAL_PALETTE.sage,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: NATURAL_PALETTE.sage,
      letterSpacing: '0.02em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
      color: NATURAL_PALETTE.forest,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: NATURAL_PALETTE.sage,
    },
    button: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      color: NATURAL_PALETTE.sageLight,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --font-serif: 'Cormorant Garamond', Georgia, serif;
          --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
        html {
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: ${NATURAL_PALETTE.canvas};
          color: ${NATURAL_PALETTE.forest};
          font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        @keyframes breathePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `,
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          padding: '10px 24px',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          backgroundColor: NATURAL_PALETTE.moss,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: NATURAL_PALETTE.mossDark,
            boxShadow: '0 4px 14px rgba(127, 147, 80, 0.3)',
          },
        },
        outlined: {
          borderColor: NATURAL_PALETTE.border,
          color: NATURAL_PALETTE.forest,
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: NATURAL_PALETTE.moss,
            backgroundColor: NATURAL_PALETTE.surfaceHighlight,
          },
        },
        text: {
          color: NATURAL_PALETTE.moss,
          '&:hover': {
            backgroundColor: alpha(NATURAL_PALETTE.moss, 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: NATURAL_PALETTE.paper,
          border: `1px solid ${NATURAL_PALETTE.border}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          transition:
            'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: alpha(NATURAL_PALETTE.moss, 0.4),
            boxShadow: '0 8px 24px rgba(44, 48, 34, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 24,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: NATURAL_PALETTE.surfaceHighlight,
          color: NATURAL_PALETTE.forest,
          border: `1px solid ${NATURAL_PALETTE.border}`,
        },
        outlined: {
          borderColor: NATURAL_PALETTE.border,
          color: NATURAL_PALETTE.sage,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: NATURAL_PALETTE.canvas,
            borderColor: NATURAL_PALETTE.border,
            transition: 'border-color 0.2s, background-color 0.2s',
            '& fieldset': {
              borderColor: NATURAL_PALETTE.border,
            },
            '&:hover fieldset': {
              borderColor: NATURAL_PALETTE.moss,
            },
            '&.Mui-focused fieldset': {
              borderColor: NATURAL_PALETTE.moss,
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '16px !important',
          border: `1px solid ${NATURAL_PALETTE.border}`,
          backgroundColor: NATURAL_PALETTE.paper,
          boxShadow: 'none',
          marginBottom: 12,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '0 0 12px 0',
            borderColor: alpha(NATURAL_PALETTE.moss, 0.4),
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          '& .MuiAccordionSummary-expandIconWrapper': {
            color: NATURAL_PALETTE.moss,
          },
        },
        content: {
          margin: 0,
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 20px 20px 20px',
          borderTop: `1px solid ${NATURAL_PALETTE.surfaceSubtle}`,
          paddingTop: 16,
          color: NATURAL_PALETTE.sage,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backgroundColor: NATURAL_PALETTE.canvas,
          border: `1px solid ${NATURAL_PALETTE.border}`,
          boxShadow: '0 20px 40px rgba(44, 48, 34, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(NATURAL_PALETTE.canvas, 0.9),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${NATURAL_PALETTE.border}`,
          color: NATURAL_PALETTE.forest,
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: NATURAL_PALETTE.moss,
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: NATURAL_PALETTE.sage,
          '&.Mui-selected': {
            color: NATURAL_PALETTE.forest,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: NATURAL_PALETTE.sageLight,
          '&.Mui-checked': {
            color: NATURAL_PALETTE.moss,
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: NATURAL_PALETTE.moss,
            '& + .MuiSwitch-track': {
              backgroundColor: NATURAL_PALETTE.moss,
            },
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
