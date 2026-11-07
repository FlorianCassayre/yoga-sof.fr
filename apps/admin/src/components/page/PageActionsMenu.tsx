'use client';

import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVertical } from 'lucide-react';
import { Fragment, useState } from 'react';

import { Link } from '../link/Link';
import type { PageAction, PageActionGroup } from './PageAction';

const PageActionMenuItem = ({ action, onClose }: { action: PageAction; onClose: () => void }) => {
  const Icon = action.icon;
  const content = (
    <>
      {Icon && (
        <ListItemIcon>
          <Icon size={18} />
        </ListItemIcon>
      )}
      <ListItemText>{action.label}</ListItemText>
    </>
  );
  return action.href ? (
    <MenuItem component={Link} href={action.href} onClick={onClose}>
      {content}
    </MenuItem>
  ) : (
    <MenuItem
      disabled={action.disabled}
      onClick={() => {
        onClose();
        action.onClick?.();
      }}
    >
      {content}
    </MenuItem>
  );
};

interface PageActionsMenuProps {
  actions: PageActionGroup[];
}

export const PageActionsMenu = ({ actions }: PageActionsMenuProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const closeMenu = () => setAnchor(null);
  const groups = actions
    .map((group) => ({ ...group, children: group.children.filter((action) => !action.fab) }))
    .filter((group) => group.children.length > 0);
  const empty = groups.length === 0;

  return (
    <>
      <IconButton
        edge="end"
        onClick={(event) => setAnchor(event.currentTarget)}
        disabled={empty}
        sx={empty ? { visibility: 'hidden' } : undefined}
      >
        <MoreVertical size={20} />
      </IconButton>
      <Menu anchorEl={anchor} open={anchor !== null && !empty} onClose={closeMenu}>
        {groups.map((group, groupIndex) => (
          <Fragment key={group.title ?? groupIndex}>
            {groupIndex > 0 && <Divider />}
            {group.title && <ListSubheader>{group.title}</ListSubheader>}
            {group.children.map((action) => (
              <PageActionMenuItem key={action.label} action={action} onClose={closeMenu} />
            ))}
          </Fragment>
        ))}
      </Menu>
    </>
  );
};
