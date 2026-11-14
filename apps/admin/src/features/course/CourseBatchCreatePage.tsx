'use client';

import { skipToken } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseBatchForm } from './CourseBatchForm';
import { CourseIcon } from './CourseIcon';

interface CourseBatchCreatePageProps {
  bundleId?: number;
}

export const CourseBatchCreatePage = ({ bundleId }: CourseBatchCreatePageProps) => {
  const presetBundle = api.courseBundle.get.useQuery(
    bundleId == null ? skipToken : { id: bundleId },
  );

  if (bundleId != null) {
    if (presetBundle.isPending) {
      return null;
    }
    if (isNotFoundError(presetBundle.error)) {
      notFound();
    }
    if (!presetBundle.data) {
      return null;
    }
  }

  return (
    <PageLayout icon={CourseIcon} title="Nouvelles séances">
      <CourseBatchForm presetBundle={presetBundle.data ?? undefined} />
    </PageLayout>
  );
};
