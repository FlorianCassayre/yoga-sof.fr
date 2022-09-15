import { Email, Facebook, Google, QuestionMark } from '@mui/icons-material';
import React from 'react';

type MuiColor = 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
type MuiVariant = 'contained' | 'outlined';

export const AuthProviders: Record<string | 'fallback', { name: string, icon: React.ReactElement, color: MuiColor, variant: MuiVariant }> = {
  google: {
    name: 'Google',
    icon: <Google />,
    color: 'inherit',
    variant: 'contained',
  },
  facebook: {
    name: 'Facebook',
    icon: <Facebook />,
    color: 'primary',
    variant: 'contained',
  },
  email: {
    name: 'E-mail',
    icon: <Email />,
    color: 'primary',
    variant: 'contained',
  },
  fallback: {
    name: '?',
    icon: <QuestionMark />,
    color: 'inherit',
    variant: 'outlined',
  },
};
