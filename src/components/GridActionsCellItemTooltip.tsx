import React from 'react';
import { GridActionsCellItem, GridActionsCellItemProps } from '@mui/x-data-grid';
import { Tooltip } from '@mui/material';
import { UrlObject } from 'url';
import Link from 'next/link';

export const GridActionsCellItemTooltip = ({ href, ...props }: GridActionsCellItemProps & { icon: React.ReactElement, href?: UrlObject | string }): React.ReactElement => {
  return (
    <Tooltip title={props.label}>
      <span>
        {href ? (
          <Link href={href} passHref legacyBehavior>
            <GridActionsCellItem {...props as any} component="a" />
          </Link>
        ) : (
          <GridActionsCellItem {...props as any} />
        )}
      </span>
    </Tooltip>
  );
};
