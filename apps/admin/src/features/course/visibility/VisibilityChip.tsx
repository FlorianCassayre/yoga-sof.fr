'use client';

import { Chip } from '@mui/material';
import { COURSE_VISIBILITY_LABELS, type CourseVisibility } from '@yoga-sof/core';

import { COURSE_VISIBILITY_ICONS } from './courseVisibilityIcons';

interface VisibilityChipProps {
  visibility: CourseVisibility;
}

export const VisibilityChip = ({ visibility }: VisibilityChipProps) => {
  const Icon = COURSE_VISIBILITY_ICONS[visibility];

  return (
    <Chip
      icon={<Icon size={20} />}
      label={COURSE_VISIBILITY_LABELS[visibility]}
      variant="outlined"
      color={visibility === 'private' ? 'warning' : 'default'}
    />
  );
};
