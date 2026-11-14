'use client';

import { PackagePlus } from 'lucide-react';

import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
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
              label: 'Nouveau lot de séances',
              icon: PackagePlus,
              href: '/lots/creation',
              fab: true,
            },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseBundleIcon} title="Lots de séances" actions={actions}>
      <CourseBundleGrid />
    </PageLayout>
  );
};
