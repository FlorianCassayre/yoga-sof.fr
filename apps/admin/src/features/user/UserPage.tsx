'use client';

import { Stack, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { RecordTimestamp } from '../../components/detail/RecordTimestamp';
import type { TabItem } from '../../components/tabs/Tabs';
import { Tabs } from '../../components/tabs/Tabs';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CardGrid } from '../card/CardGrid';
import { CardIcon } from '../card/CardIcon';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { CourseUserRegistrationIcon } from '../courseUserRegistration/CourseUserRegistrationIcon';
import { MembershipGrid } from '../membership/MembershipGrid';
import { MembershipIcon } from '../membership/MembershipIcon';
import { UserIcon } from './UserIcon';

const MEMBERSHIP_TAB = 'membership';
const CARD_TAB = 'card';

type UserTab = typeof MEMBERSHIP_TAB | typeof CARD_TAB;

const TABS: TabItem<UserTab>[] = [
  { value: MEMBERSHIP_TAB, label: 'Adhésions', icon: MembershipIcon },
  { value: CARD_TAB, label: 'Cartes', icon: CardIcon },
];

interface UserPageProps {
  id: string;
}

export const UserPage = ({ id }: UserPageProps) => {
  const user = api.user.get.useQuery({ id });
  const [tab, setTab] = useState<UserTab>(MEMBERSHIP_TAB);

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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <UserIcon size={24} />
        <Typography variant="h5">Utilisateur</Typography>
      </Stack>
      <RecordDetails
        entries={[
          { label: 'Nom', value: user.data.name ?? '-' },
          { label: 'Email', value: user.data.email ?? '-' },
          {
            label: 'Vérifié',
            value: user.data.emailVerified ? (
              <RecordTimestamp date={user.data.emailVerified} />
            ) : (
              'Non'
            ),
          },
        ]}
      />
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CourseUserRegistrationIcon size={18} />
          <Typography variant="h6">Inscriptions</Typography>
        </Stack>
        <CourseUserRegistrationGrid userId={user.data.id} />
      </Stack>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CourseUserRegistrationIcon size={18} />
          <Typography variant="h6">Historique</Typography>
        </Stack>
        <CourseUserRegistrationEventGrid userId={user.data.id} />
      </Stack>
      <Stack spacing={2}>
        <Tabs value={tab} tabs={TABS} onChange={setTab} />
        {tab === MEMBERSHIP_TAB && <MembershipGrid userId={user.data.id} />}
        {tab === CARD_TAB && <CardGrid userId={user.data.id} />}
      </Stack>
    </Stack>
  );
};
