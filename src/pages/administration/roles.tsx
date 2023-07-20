import React from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { AdminPanelSettings, Check, Close } from '@mui/icons-material';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { UserRoleGrid } from '../../components/grid/grids/UserRoleGrid';
import { PermissionNames, Permissions, RoleNames } from '../../common/role';
import { UserRole } from '@prisma/client';

export default function AdminRoles() {
  const permissions = Object.keys(Permissions)
    .map(permission => permission as keyof typeof Permissions)
    .map(permission => ({
      id: permission,
      roles: Permissions[permission],
      description: PermissionNames[permission],
    }));
  const roles = Object.keys(UserRole)
    .map(role => role as UserRole)
    .map(role => ({
      id: role,
      name: RoleNames[role],
    }))
    .reverse();

  return (
    <BackofficeContent
      title="Rôles"
      icon={<AdminPanelSettings />}
    >
      <Typography paragraph>
        Liste des utilisateurs ayant des rôles spécifiques sur l'application.
        Pour des raisons de sécurité, cette liste n'est pas directement modifiable depuis l'interface.
      </Typography>
      <UserRoleGrid />

      <Typography variant="h6" component="div" sx={{ mt: 2, mb: 1 }}>
        Permissions
      </Typography>
      <Typography paragraph sx={{ mb: 1 }}>
        Tableau récapitulant les rôles et les permissions accordées pour ceux-ci.
      </Typography>
      <Card variant="outlined" sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 300 }}>Permission</TableCell>
              {roles.map(({ id, name }) => (
                <TableCell key={id} align="center" width={200} sx={{ minWidth: 130 }}>{name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map(({ id, roles: rolesForPermission, description }) => (
              <TableRow key={id}>
                <TableCell>
                  {description}
                </TableCell>
                {roles.map(({ id }) => (
                  <TableCell key={id} sx={{ textAlign: 'center' }}>
                    {rolesForPermission.includes(id) ? (
                      <Check color="success" />
                    ) : (
                      <Close color="error" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

    </BackofficeContent>
  );
}
