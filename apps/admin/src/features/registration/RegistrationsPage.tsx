'use client';

import { Stack, Typography } from '@mui/material';

import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import { CourseUserWaitingListGrid } from '../courseUserWaitingList/CourseUserWaitingListGrid';
import { useHasPermission } from '../user/useHasPermission';
import { RegistrationEventGrid } from './RegistrationEventGrid';
import { RegistrationGrid } from './RegistrationGrid';
import { RegistrationIcon } from './RegistrationIcon';

export const RegistrationsPage = () => {
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
    <PageLayout icon={RegistrationIcon} title="Inscriptions" actions={actions}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">Historique des événements</Typography>
          <RegistrationEventGrid />
        </Stack>
        <RegistrationGrid />
        <Stack spacing={1}>
          <Typography variant="h6">Liste d'attente</Typography>
          <CourseUserWaitingListGrid />
        </Stack>
      </Stack>
    </PageLayout>
  );
};
