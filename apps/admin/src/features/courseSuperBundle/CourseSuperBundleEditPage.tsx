'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseSuperBundleForm } from './CourseSuperBundleForm';
import { CourseSuperBundleIcon } from './CourseSuperBundleIcon';

export const CourseSuperBundleEditPage = ({ id }: { id: number }) => {
  return (
    <PageLayout icon={CourseSuperBundleIcon} title="Ensemble de lots de séances">
      <CourseSuperBundleForm id={id} />
    </PageLayout>
  );
};
