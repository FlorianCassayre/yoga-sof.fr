'use client';

import { Stack, Typography } from '@mui/material';
import { PackagePlus } from 'lucide-react';

import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { CourseSuperBundleGrid } from '../courseSuperBundle/CourseSuperBundleGrid';
import { useHasPermission } from '../user/useHasPermission';
import { CourseBundleGrid } from './CourseBundleGrid';
import { CourseBundleIcon } from './CourseBundleIcon';

export const CourseBundlesPage = () => {
  const canManage = useHasPermission('manageData');
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            {
              label: 'Nouvel ensemble de lots',
              icon: PackagePlus,
              href: '/ensembles/creation',
              fab: true,
            },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseBundleIcon} title="Lots de séances" actions={actions}>
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Typography variant="h6">Ensembles de lots de séances</Typography>
          <CourseSuperBundleGrid />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h6">Lots de séances</Typography>
          <CourseBundleGrid />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
