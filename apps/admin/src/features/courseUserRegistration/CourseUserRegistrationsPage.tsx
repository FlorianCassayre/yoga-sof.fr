'use client';

import { Stack, Typography } from '@mui/material';

import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { CourseUserWaitingListGrid } from '../courseUserWaitingList/CourseUserWaitingListGrid';
import { useHasPermission } from '../user/useHasPermission';
import { CourseUserRegistrationEventGrid } from './CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from './CourseUserRegistrationGrid';
import { CourseUserRegistrationIcon } from './CourseUserRegistrationIcon';

export const CourseUserRegistrationsPage = () => {
  const canManage = useHasPermission('manageData');
  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            { label: 'Inscrire des utilisateurs', href: '/inscriptions/creation', fab: true },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={CourseUserRegistrationIcon} title="Inscriptions" actions={actions}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">Historique des événements</Typography>
          <CourseUserRegistrationEventGrid />
        </Stack>
        <CourseUserRegistrationGrid />
        <Stack spacing={1}>
          <Typography variant="h6">Liste d'attente</Typography>
          <CourseUserWaitingListGrid />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
