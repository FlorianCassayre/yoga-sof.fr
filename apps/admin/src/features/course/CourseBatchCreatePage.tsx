'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseBatchForm } from './CourseBatchForm';
import { CourseIcon } from './CourseIcon';

export const CourseBatchCreatePage = () => {
  return (
    <PageLayout icon={CourseIcon} title="Nouvelles séances">
      <CourseBatchForm />
    </PageLayout>
  );
};
