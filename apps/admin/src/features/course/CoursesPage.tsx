'use client';

import { CalendarPlus } from 'lucide-react';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseGrid } from './CourseGrid';
import { CourseIcon } from './CourseIcon';

export const CoursesPage = () => {
  return (
    <PageLayout
      icon={CourseIcon}
      title="Séances"
      actions={[
        {
          children: [
            { label: 'Nouvelle séance', icon: CalendarPlus, href: '/seances/creation', fab: true },
          ],
        },
      ]}
    >
      <CourseGrid />
    </PageLayout>
  );
};
