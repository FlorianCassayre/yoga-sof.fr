import React from 'react';
import { Chip, Divider, Stack } from '@mui/material';
import { ArrowDownward, ExpandMore } from '@mui/icons-material';

interface HomepageDividerProps {
  children: string;
  arrows?: boolean;
}

export const HomepageDivider: React.FC<HomepageDividerProps> = ({ children, arrows }) => {
  const renderIcon = () => (
    <ExpandMore sx={{ color: 'grey.700' }} />
  );
  const renderLabel = () => arrows ? (
    <Stack direction="row" gap={0.5} alignItems="center">
      {renderIcon()}
      {children}
      {renderIcon()}
    </Stack>
  ) : children;

  return (
    <Divider textAlign="center" sx={{ mb: 2 }}>
      <Chip label={renderLabel()} />
    </Divider>
  );
};
