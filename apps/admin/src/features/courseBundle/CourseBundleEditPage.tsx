'use client';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseBundleForm } from './CourseBundleForm';
import { CourseBundleIcon } from './CourseBundleIcon';

interface CourseBundleEditPageProps {
  id: number;
}

export const CourseBundleEditPage = ({ id }: CourseBundleEditPageProps) => {
  return (
    <PageLayout icon={CourseBundleIcon} title="Modifier le lot de séances">
      <CourseBundleForm id={id} />
    </PageLayout>
  );
};
