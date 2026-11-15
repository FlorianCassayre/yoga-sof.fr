'use client';

import { Box } from '@mui/material';

interface CourseCountsProps {
  registeredCount: number | null;
  capacity: number | null;
  presence?: { pending: number; present: number; absent: number };
}

export const CourseCounts = ({ registeredCount, capacity, presence }: CourseCountsProps) => {
  const presentColor =
    presence === undefined
      ? undefined
      : presence.pending > 0
        ? 'warning.main'
        : presence.absent > 0
          ? 'error.main'
          : presence.present === 0
            ? 'text.disabled'
            : 'success.main';
  const registeredColor =
    registeredCount === null
      ? undefined
      : registeredCount === 0
        ? 'text.disabled'
        : capacity !== null && registeredCount >= capacity
          ? 'success.dark'
          : 'success.main';

  return (
    <Box component="span" sx={{ verticalAlign: 'middle' }}>
      {presence !== undefined && presentColor !== undefined && (
        <>
          <Box component="span" sx={{ color: presentColor }}>
            {presence.present}
          </Box>
          {' / '}
        </>
      )}
      <Box component="span" sx={registeredColor ? { color: registeredColor } : undefined}>
        {registeredCount ?? '-'}
      </Box>
      {' / '}
      {capacity ?? '-'}
    </Box>
  );
};
