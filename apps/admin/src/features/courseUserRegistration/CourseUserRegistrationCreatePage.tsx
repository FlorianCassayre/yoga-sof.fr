'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseUserRegistrationForm } from './CourseUserRegistrationForm';
import { CourseUserRegistrationIcon } from './CourseUserRegistrationIcon';

interface CourseUserRegistrationCreatePageProps {
  courseId?: number;
  userId?: string;
}

export const CourseUserRegistrationCreatePage = ({
  courseId,
  userId,
}: CourseUserRegistrationCreatePageProps) => {
  return (
    <PageLayout icon={CourseUserRegistrationIcon} title="Inscrire des utilisateurs">
      <CourseUserRegistrationForm courseId={courseId} userId={userId} />
    </PageLayout>
  );
};
