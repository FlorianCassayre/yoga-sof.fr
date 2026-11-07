'use client';

import { Chip, type ChipProps } from '@mui/material';
import { CARD_STATUS_LABELS, type CardStatus } from '@yoga-sof/core';

const CARD_STATUS_COLORS: Record<CardStatus, ChipProps['color']> = {
  active: 'success',
  canceled: 'default',
  empty: 'warning',
  expired: 'error',
};

interface CardStatusChipProps {
  status: CardStatus;
  size?: ChipProps['size'];
}

export const CardStatusChip = ({ status, size }: CardStatusChipProps) => (
  <Chip
    label={CARD_STATUS_LABELS[status]}
    color={CARD_STATUS_COLORS[status]}
    variant="outlined"
    size={size}
  />
);
