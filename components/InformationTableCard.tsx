import React from 'react';
import { Card,  } from '@mui/material';
import { InformationTable } from './InformationTable';

type InformationTableCardProps = Parameters<typeof InformationTable>[0];

export const InformationTableCard: React.FC<InformationTableCardProps> = (props) => {
  return (
    <Card variant="outlined" sx={{ borderBottom: 'none' }}>
      <InformationTable {...props} />
    </Card>
  );
};
