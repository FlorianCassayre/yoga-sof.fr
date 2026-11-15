'use client';

import { Stack, Typography } from '@mui/material';
import { formatPrice } from '@yoga-sof/core';
import { Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';

import { RecordDetails } from '../../components/detail/RecordDetails';
import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseBundleGrid } from '../courseBundle/CourseBundleGrid';
import { formatCourseBundlePeriod } from '../courseBundle/formatCourseBundlePeriod';
import { useHasPermission } from '../user/useHasPermission';
import { CourseSuperBundleIcon } from './CourseSuperBundleIcon';

interface CourseSuperBundlePageProps {
  id: number;
}

export const CourseSuperBundlePage = ({ id }: CourseSuperBundlePageProps) => {
  const superBundle = api.courseSuperBundle.get.useQuery({ id });
  const canManage = useHasPermission('manageData');

  if (superBundle.isPending) {
    return null;
  }

  if (isNotFoundError(superBundle.error)) {
    notFound();
  }

  if (!superBundle.data) {
    return null;
  }

  const row = superBundle.data;
  const period = formatCourseBundlePeriod(row) ?? '-';
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [{ label: 'Modifier', icon: Pencil, href: `/ensembles/${id}/edition` }],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseSuperBundleIcon} title={row.label} actions={actions}>
      <RecordDetails
        entries={[
          { label: 'Prix', value: formatPrice(row.price) },
          { label: 'Période', value: period },
        ]}
      />
      <Stack spacing={2}>
        <Typography variant="h6">Lots de séances</Typography>
        <CourseBundleGrid courseSuperBundleId={id} />
      </Stack>
    </PageLayout>
  );
};
