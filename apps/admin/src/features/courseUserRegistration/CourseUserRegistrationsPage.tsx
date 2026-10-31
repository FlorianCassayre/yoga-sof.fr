'use client';

import { Stack, Typography } from '@mui/material';

import { PageLayout } from '../../components/page/PageLayout';
import { CourseUserRegistrationEventGrid } from './CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from './CourseUserRegistrationGrid';
import { CourseUserRegistrationIcon } from './CourseUserRegistrationIcon';

export const CourseUserRegistrationsPage = () => {
  return (
    <PageLayout
      icon={CourseUserRegistrationIcon}
      title="Inscriptions"
      actions={[
        {
          children: [
            { label: 'Inscrire des utilisateurs', href: '/inscriptions/creation', fab: true },
          ],
        },
      ]}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">Historique des événements</Typography>
          <CourseUserRegistrationEventGrid />
        </Stack>
        <CourseUserRegistrationGrid />
      </Stack>
    </PageLayout>
  );
};
