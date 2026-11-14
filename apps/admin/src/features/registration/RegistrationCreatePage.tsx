'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { RegistrationForm } from './RegistrationForm';
import { RegistrationIcon } from './RegistrationIcon';

interface RegistrationCreatePageProps {
  courseId?: number;
  courseBundleId?: number;
  userId?: string;
}

export const RegistrationCreatePage = ({
  courseId,
  courseBundleId,
  userId,
}: RegistrationCreatePageProps) => {
  return (
    <PageLayout icon={RegistrationIcon} title="Inscrire des utilisateurs">
      <RegistrationForm courseId={courseId} courseBundleId={courseBundleId} userId={userId} />
    </PageLayout>
  );
};
