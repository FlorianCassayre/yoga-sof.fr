import React from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { BasicSpeedDial } from './BasicSpeedDial';
import { useRouter } from 'next/router';

interface MoreActionsButtonProps {
  actions: Parameters<typeof BasicSpeedDial>[0]['actions'];
}

export const MoreActionsButton: React.FunctionComponent<MoreActionsButtonProps> = ({ actions }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ my: -1 }}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.name}
            onClick={() => {
              if (!action.disabled) {
                action.url && router.push(action.url);
                action.onClick && action.onClick();
                handleClose();
              }
            }}
          >
            <ListItemIcon>
              {action.icon}
            </ListItemIcon>
            <ListItemText>
              {action.name}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
