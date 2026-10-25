'use client';

import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface FormShellProps {
  submitLabel: string;
  submitting?: boolean;
  cancelHref: string;
  children: ReactNode;
}

export const FormShell = ({ submitLabel, submitting, cancelHref, children }: FormShellProps) => {
  return (
    <Stack spacing={2}>
      {children}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button component={Link} href={cancelHref} variant="outlined" disabled={submitting}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
