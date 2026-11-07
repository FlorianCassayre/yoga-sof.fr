'use client';

import { Chip, type ChipProps } from '@mui/material';
import { MEMBERSHIP_TYPE_LABELS, type MembershipType } from '@yoga-sof/core';

import { MEMBERSHIP_TYPE_ICONS } from './membershipTypeIcons';

interface MembershipTypeChipProps {
  type: MembershipType;
  size?: ChipProps['size'];
}

export const MembershipTypeChip = ({ type, size }: MembershipTypeChipProps) => {
  const Icon = MEMBERSHIP_TYPE_ICONS[type];

  return (
    <Chip
      icon={<Icon size={20} />}
      label={MEMBERSHIP_TYPE_LABELS[type]}
      variant="outlined"
      size={size}
    />
  );
};
