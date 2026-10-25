'use client';

import { Stack, Typography } from '@mui/material';
import { dateTimeFormatter } from '@yoga-sof/ui/dateTimeFormatter';
import { notFound } from 'next/navigation';

import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';

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
  );
};
