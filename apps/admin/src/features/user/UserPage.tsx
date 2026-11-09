'use client';

import { Stack, Typography } from '@mui/material';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { RecordDetails } from '../../components/detail/RecordDetails';
import { RecordTimestamp } from '../../components/detail/RecordTimestamp';
import type { PageActionGroup } from '../../components/page/PageAction';
import { PageLayout } from '../../components/page/PageLayout';
import type { TabItem } from '../../components/tabs/Tabs';
import { Tabs } from '../../components/tabs/Tabs';
import { api } from '../../server/api';
import { isNotFoundError } from '../../server/isNotFoundError';
import { CardGrid } from '../card/CardGrid';
import { CardIcon } from '../card/CardIcon';
import { CourseUserRegistrationEventGrid } from '../courseUserRegistration/CourseUserRegistrationEventGrid';
import { CourseUserRegistrationGrid } from '../courseUserRegistration/CourseUserRegistrationGrid';
import { CourseUserRegistrationIcon } from '../courseUserRegistration/CourseUserRegistrationIcon';
import { CourseUserWaitingListGrid } from '../courseUserWaitingList/CourseUserWaitingListGrid';
import { CourseUserWaitingListIcon } from '../courseUserWaitingList/CourseUserWaitingListIcon';
import { EmailGrid } from '../email/EmailGrid';
import { EmailIcon } from '../email/EmailIcon';
import { MembershipGrid } from '../membership/MembershipGrid';
import { MembershipIcon } from '../membership/MembershipIcon';
import { useHasPermission } from './useHasPermission';
import { UserIcon } from './UserIcon';

const HISTORY_TAB = 'history';
const MEMBERSHIP_TAB = 'membership';
const CARD_TAB = 'card';
const WAITING_LIST_TAB = 'waitingList';
const EMAIL_TAB = 'email';

type UserTab =
  | typeof HISTORY_TAB
  | typeof MEMBERSHIP_TAB
  | typeof CARD_TAB
  | typeof WAITING_LIST_TAB
  | typeof EMAIL_TAB;

const TABS: TabItem<UserTab>[] = [
  { value: HISTORY_TAB, label: 'Historique', icon: CourseUserRegistrationIcon },
  { value: MEMBERSHIP_TAB, label: 'Adhésions', icon: MembershipIcon },
  { value: CARD_TAB, label: 'Cartes', icon: CardIcon },
  { value: WAITING_LIST_TAB, label: "Liste d'attente", icon: CourseUserWaitingListIcon },
  { value: EMAIL_TAB, label: 'E-mails', icon: EmailIcon },
];

interface UserPageProps {
  id: string;
}

export const UserPage = ({ id }: UserPageProps) => {
  const user = api.user.get.useQuery({ id });
  const canManage = useHasPermission('manageData');
  const [tab, setTab] = useState<UserTab>(HISTORY_TAB);

  if (user.isPending) {
    return null;
  }

  if (isNotFoundError(user.error)) {
    notFound();
  }

  if (!user.data) {
    return null;
  }

  const actions: PageActionGroup[] | undefined = canManage
    ? [
        {
          children: [
            {
              label: 'Inscrire des utilisateurs',
              icon: CourseUserRegistrationIcon,
              href: `/inscriptions/creation?userId=${id}`,
              fab: true,
            },
          ],
        },
      ]
    : undefined;

  return (
    <PageLayout icon={UserIcon} title="Utilisateur" actions={actions}>
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
        <Tabs value={tab} tabs={TABS} onChange={setTab} />
        {tab === HISTORY_TAB && <CourseUserRegistrationEventGrid userId={user.data.id} />}
        {tab === MEMBERSHIP_TAB && <MembershipGrid userId={user.data.id} />}
        {tab === CARD_TAB && <CardGrid userId={user.data.id} />}
        {tab === WAITING_LIST_TAB && <CourseUserWaitingListGrid userId={user.data.id} />}
        {tab === EMAIL_TAB && <EmailGrid userId={user.data.id} />}
      </Stack>
    </PageLayout>
  );
};
