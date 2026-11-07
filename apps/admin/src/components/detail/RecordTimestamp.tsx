'use client';

import { Typography } from '@mui/material';
import { formatRelativeTimestamp, formatTimestamp } from '@yoga-sof/core';

export const RecordTimestamp = ({ date }: { date: Date | null }) => {
  if (!date) {
    return null;
  }

  const absolute = formatTimestamp(date);

  return (
    <Typography component="span" variant="inherit">
      {formatRelativeTimestamp(date)}{' '}
      <Typography component="span" variant="caption" color="text.secondary">
        ({absolute.charAt(0).toLowerCase()}
        {absolute.slice(1)})
      </Typography>
    </Typography>
  );
};
