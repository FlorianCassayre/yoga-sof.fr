'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseForm } from './CourseForm';
import { CourseIcon } from './CourseIcon';

interface CourseEditPageProps {
  id: string;
}

export const CourseEditPage = ({ id }: CourseEditPageProps) => {
  return (
    <PageLayout icon={CourseIcon} title="Modifier la séance">
      <CourseForm id={Number(id)} />
    </PageLayout>
  );
};
