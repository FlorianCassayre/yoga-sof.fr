'use client';

import { Stack, Typography } from '@mui/material';
import { COURSE_TYPE_LABELS, formatPrice } from '@yoga-sof/core';
import { CalendarPlus, Pencil } from 'lucide-react';
import { notFound } from 'next/navigation';

import { RecordDetails } from '../../components/detail/RecordDetails';
import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseGrid } from '../course/CourseGrid';
import { RegistrationEventGrid } from '../registration/RegistrationEventGrid';
import { RegistrationGrid } from '../registration/RegistrationGrid';
import { useHasPermission } from '../user/useHasPermission';
import { CourseBundleIcon } from './CourseBundleIcon';
import { formatCourseBundlePeriod } from './formatCourseBundlePeriod';

interface CourseBundlePageProps {
  id: number;
}

export const CourseBundlePage = ({ id }: CourseBundlePageProps) => {
  const bundle = api.courseBundle.get.useQuery({ id });
  const canManage = useHasPermission('manageData');

  if (bundle.isPending) {
    return null;
  }

  if (isNotFoundError(bundle.error)) {
    notFound();
  }

  if (!bundle.data) {
    return null;
  }

  const row = bundle.data;
  const period = formatCourseBundlePeriod(row) ?? '-';
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            { label: 'Modifier', icon: Pencil, href: `/lots/${id}/edition` },
            {
              label: 'Nouvelles séances',
              icon: CalendarPlus,
              href: `/seances/creation?bundleId=${id}`,
              fab: true,
            },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseBundleIcon} title={row.label} actions={actions}>
      <RecordDetails
        entries={[
          { label: 'Type', value: COURSE_TYPE_LABELS[row.type] },
          { label: 'Prix', value: formatPrice(row.price) },
          { label: 'Capacité', value: row.capacity },
          { label: 'Inscrits', value: row.registeredCount },
          { label: 'Période', value: period },
        ]}
      />
      <Stack spacing={2}>
        <Typography variant="h6">Séances</Typography>
        <CourseGrid courseBundleId={id} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Inscriptions</Typography>
        <RegistrationGrid courseBundleId={id} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Historique</Typography>
        <RegistrationEventGrid courseBundleId={id} />
      </Stack>
    </PageLayout>
  );
};
