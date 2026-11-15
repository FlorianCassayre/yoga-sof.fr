'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseSuperBundleForm } from './CourseSuperBundleForm';
import { CourseSuperBundleIcon } from './CourseSuperBundleIcon';

export const CourseSuperBundleCreatePage = () => {
  return (
    <PageLayout icon={CourseSuperBundleIcon} title="Nouvel ensemble de lots de séances">
      <CourseSuperBundleForm />
    </PageLayout>
  );
};
