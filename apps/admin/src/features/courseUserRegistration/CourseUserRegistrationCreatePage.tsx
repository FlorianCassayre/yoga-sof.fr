'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseUserRegistrationForm } from './CourseUserRegistrationForm';
import { CourseUserRegistrationIcon } from './CourseUserRegistrationIcon';

interface CourseUserRegistrationCreatePageProps {
  courseId?: number;
}

export const CourseUserRegistrationCreatePage = ({
  courseId,
}: CourseUserRegistrationCreatePageProps) => {
  return (
    <PageLayout icon={CourseUserRegistrationIcon} title="Inscrire des utilisateurs">
      <CourseUserRegistrationForm courseId={courseId} />
    </PageLayout>
  );
};
