'use client';

import { Divider, Link, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Euro } from 'lucide-react';

import { PageLayout } from '../../components/page/PageLayout';
import { CalendarSettingForm } from '../calendar/CalendarSettingForm';
import { MembershipPriceGrid } from '../membership/price/MembershipPriceGrid';
import { MembershipSettingForm } from '../membership/settings/MembershipSettingForm';
import { SettingsIcon } from './SettingsIcon';

export const MEMBERSHIP_TAB = 'membership';
export const CALENDAR_TAB = 'calendar';

const TABS = [
  { id: MEMBERSHIP_TAB, label: 'Adhésions', href: '/parametres/adhesions' },
  { id: CALENDAR_TAB, label: 'Calendrier', href: '/parametres/calendrier' },
];

interface SettingsPageProps {
  tab: string;
}

export const SettingsPage = ({ tab }: SettingsPageProps) => {
  return (
    <PageLayout
      icon={SettingsIcon}
      title="Paramètres"
      actions={[
        {
          children: [
            { label: 'Nouveau tarif', icon: Euro, href: '/parametres/tarifs/creation', fab: true },
          ],
        },
      ]}
    >
      <Tabs value={tab}>
        {TABS.map((entry) => (
          <Tab
            key={entry.id}
            value={entry.id}
            label={entry.label}
            component={Link}
            href={entry.href}
          />
        ))}
      </Tabs>
      {tab === MEMBERSHIP_TAB && (
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h6">Début de saison</Typography>
            <MembershipSettingForm />
          </Stack>
          <Divider />
          <Stack spacing={2}>
            <Typography variant="h6">Tarifs des adhésions</Typography>
            <MembershipPriceGrid />
          </Stack>
        </Stack>
      )}
      {tab === CALENDAR_TAB && (
        <Stack spacing={2}>
          <Typography variant="h6">Jours et horaires d'ouverture</Typography>
          <CalendarSettingForm />
        </Stack>
      )}
    </PageLayout>
  );
};
