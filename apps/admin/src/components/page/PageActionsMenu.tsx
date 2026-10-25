'use client';

import {
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVertical } from 'lucide-react';
import { Fragment, useState } from 'react';

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

  if (groups.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton edge="end" onClick={(event) => setAnchor(event.currentTarget)}>
        <MoreVertical size={20} />
      </IconButton>
      <Menu anchorEl={anchor} open={anchor !== null} onClose={closeMenu}>
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
