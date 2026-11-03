'use client';

import { Chip, type ChipProps } from '@mui/material';
import { COURSE_VISIBILITY_LABELS, type CourseVisibility } from '@yoga-sof/core';

import { COURSE_VISIBILITY_ICONS } from './courseVisibilityIcons';

interface VisibilityChipProps {
  visibility: CourseVisibility;
  size?: ChipProps['size'];
}

export const VisibilityChip = ({ visibility, size }: VisibilityChipProps) => {
  const Icon = COURSE_VISIBILITY_ICONS[visibility];

  return (
    <Chip
      icon={<Icon size={20} />}
      label={COURSE_VISIBILITY_LABELS[visibility]}
      variant="outlined"
      color={visibility === 'private' ? 'warning' : 'default'}
      size={size}
    />
  );
};
