import type { ThemeOptions } from '@mui/material';

import { NATURAL_PALETTE } from './palette';

export const fontPrimary =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
export const fontSecondary = '"Cormorant Variable", Georgia, serif';

export const typography: ThemeOptions['typography'] = {
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
    lineHeight: 1.25,
  },
  h4: {
    fontFamily: fontSecondary,
    fontWeight: 600,
    color: NATURAL_PALETTE.forest,
    lineHeight: 1.3,
  },
  h5: {
    fontFamily: fontSecondary,
    fontWeight: 600,
    color: NATURAL_PALETTE.forest,
    lineHeight: 1.35,
  },
  h6: {
    fontWeight: 700,
    color: NATURAL_PALETTE.forest,
    fontSize: '1rem',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1.6,
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
    fontWeight: 600,
    textTransform: 'none',
    letterSpacing: '0.02em',
  },
  caption: {
    fontSize: '0.75rem',
    color: NATURAL_PALETTE.sageLight,
  },
};
