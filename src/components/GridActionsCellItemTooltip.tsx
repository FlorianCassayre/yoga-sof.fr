import React from 'react';
import { GridActionsCellItem, GridActionsCellItemProps } from '@mui/x-data-grid';
import { Tooltip } from '@mui/material';

export const GridActionsCellItemTooltip = ({ ...props }: GridActionsCellItemProps & { icon: React.ReactElement }): React.ReactElement => {
  return (
    <Tooltip title={props.label}>
      <span>
        <GridActionsCellItem {...props as any} />
      </span>
    </Tooltip>
  );
};
