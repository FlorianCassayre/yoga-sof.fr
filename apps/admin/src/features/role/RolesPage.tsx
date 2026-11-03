'use client';

import { Divider, Stack, Typography } from '@mui/material';

import { PageLayout } from '../../components/page/PageLayout';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleGrid } from './RoleGrid';
import { RoleIcon } from './RoleIcon';

export const RolesPage = () => {
  return (
    <PageLayout icon={RoleIcon} title="Rôles">
      <Stack spacing={3}>
        <RoleGrid />
        <Divider />
        <Stack spacing={2}>
          <Typography variant="h6">Permissions</Typography>
          <PermissionMatrix />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
