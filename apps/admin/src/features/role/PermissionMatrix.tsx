'use client';

import {
  Card,
  Icon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  type Permission,
  PERMISSION_LABELS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_TYPE_LABELS,
  type RoleType,
} from '@yoga-sof/core';
import { Check, X } from 'lucide-react';

interface RoleColumn {
  label: string;
  granted: (permission: Permission) => boolean;
}

const ROLE_COLUMNS: RoleColumn[] = (
  Object.entries(ROLE_PERMISSIONS) as [RoleType, Permission[]][]
).map(([role, permissions]) => ({
  label: ROLE_TYPE_LABELS[role],
  granted: (permission) => permissions.includes(permission),
}));

const COLUMNS: RoleColumn[] = [{ label: 'Membre', granted: () => false }, ...ROLE_COLUMNS];

export const PermissionMatrix = () => {
  return (
    <Card variant="outlined">
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Permission</TableCell>
              {COLUMNS.map(({ label }) => (
                <TableCell key={label} align="center" sx={{ width: 160 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {PERMISSIONS.map((permission) => (
              <TableRow key={permission}>
                <TableCell>{PERMISSION_LABELS[permission]}</TableCell>
                {COLUMNS.map(({ label, granted }) => (
                  <TableCell key={label} align="center">
                    <Icon color={granted(permission) ? 'success' : 'error'}>
                      {granted(permission) ? <Check size={18} /> : <X size={18} />}
                    </Icon>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
