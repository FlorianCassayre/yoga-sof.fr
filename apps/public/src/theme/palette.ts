import { alpha, type ThemeOptions } from '@mui/material';

export const NATURAL_PALETTE = {
  canvas: '#FDFCF8',
  paper: '#FFFFFF',
  surfaceSubtle: '#F6F5F0',
  surfaceHighlight: '#EDF2E4',
  border: '#E5E4DC',
  forest: '#2C3022',
  sage: '#6B705C',
  sageLight: '#9FA58D',
  moss: '#7F9350',
  mossDark: '#6E8043',
  mist: '#C5C5B5',
};

export const palette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    main: NATURAL_PALETTE.moss,
    dark: NATURAL_PALETTE.mossDark,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: NATURAL_PALETTE.sage,
    dark: NATURAL_PALETTE.forest,
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
};
