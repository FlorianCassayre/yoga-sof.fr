'use client';

import { Stack, Typography } from '@mui/material';
import { dateTimeFormatter } from '@yoga-sof/core';
import { notFound } from 'next/navigation';

import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { MembershipGrid } from '../membership/MembershipGrid';

interface UserPageProps {
  id: string;
}

export const UserPage = ({ id }: UserPageProps) => {
  const user = api.user.get.useQuery({ id });

  if (user.isPending) {
    return null;
  }

  if (isNotFoundError(user.error)) {
    notFound();
  }

  if (!user.data) {
    return null;
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h5">Utilisateur</Typography>
        <Stack spacing={0.5}>
          <Typography>Nom : {user.data.name ?? '-'}</Typography>
          <Typography>Email : {user.data.email ?? '-'}</Typography>
          <Typography>
            Vérifié :{' '}
            {user.data.emailVerified ? dateTimeFormatter.format(user.data.emailVerified) : 'Non'}
          </Typography>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Inscriptions</Typography>
        <CourseUserRegistrationGrid userId={user.data.id} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Historique</Typography>
        <CourseUserRegistrationEventGrid userId={user.data.id} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Adhésions</Typography>
        <MembershipGrid userId={user.data.id} />
      </Stack>
    </Stack>
  );
};
