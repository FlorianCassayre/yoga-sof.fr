'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseForm } from './CourseForm';
import { CourseIcon } from './CourseIcon';

export const CourseCreatePage = () => {
  return (
    <PageLayout icon={CourseIcon} title="Nouvelle séance">
      <CourseForm />
    </PageLayout>
  );
};
