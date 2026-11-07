'use client';

import { CalendarPlus } from 'lucide-react';

import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { useHasPermission } from '../user/useHasPermission';
import { CourseGrid } from './CourseGrid';
import { CourseIcon } from './CourseIcon';

export const CoursesPage = () => {
  const canManage = useHasPermission('manageData');
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            {
              label: 'Nouvelles séances',
              icon: CalendarPlus,
              href: '/seances/creation',
              fab: true,
            },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseIcon} title="Séances" actions={actions}>
      <CourseGrid />
    </PageLayout>
  );
};
