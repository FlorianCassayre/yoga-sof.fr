'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseBundleForm } from './CourseBundleForm';
import { CourseBundleIcon } from './CourseBundleIcon';

export const CourseBundleCreatePage = () => {
  return (
    <PageLayout icon={CourseBundleIcon} title="Nouveau lot de séances">
      <CourseBundleForm />
    </PageLayout>
  );
};
