'use client';

import { Stack, Typography } from '@mui/material';
import { formatRelativeTimestamp, formatTimestamp } from '@yoga-sof/ui/timestamp';

export const DateTimeCell = ({ value }: { value: Date | null }) => {
  if (!value) {
    return null;
  }

  return (
    <Stack sx={{ height: '100%', justifyContent: 'center' }}>
      <Typography variant="body2">{formatRelativeTimestamp(value)}</Typography>
      <Typography variant="caption" color="text.secondary">
        {formatTimestamp(value)}
      </Typography>
    </Stack>
  );
};
