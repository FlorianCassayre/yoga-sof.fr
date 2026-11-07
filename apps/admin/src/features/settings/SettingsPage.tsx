'use client';

import { Divider, Stack, Typography } from '@mui/material';
import { Euro } from 'lucide-react';

import { PageLayout } from '../../components/page/PageLayout';
import type { TabItem } from '../../components/tabs/Tabs';
import { Tabs } from '../../components/tabs/Tabs';
import { CalendarIcon } from '../calendar/CalendarIcon';
import { CalendarSettingForm } from '../calendar/CalendarSettingForm';
import { CardIcon } from '../card/CardIcon';
import { CardSettingForm } from '../card/settings/CardSettingForm';
import { CardTemplateGrid } from '../card/template/CardTemplateGrid';
import { MembershipIcon } from '../membership/MembershipIcon';
import { MembershipPriceGrid } from '../membership/price/MembershipPriceGrid';
import { MembershipSettingForm } from '../membership/settings/MembershipSettingForm';
import { SettingsIcon } from './SettingsIcon';

export const CALENDAR_TAB = 'calendar';
export const MEMBERSHIP_TAB = 'membership';
export const CARD_TAB = 'card';

export type SettingsTab = typeof CALENDAR_TAB | typeof MEMBERSHIP_TAB | typeof CARD_TAB;

const TABS: TabItem<SettingsTab>[] = [
  {
    value: CALENDAR_TAB,
    label: 'Calendrier',
    href: '/parametres/calendrier',
    icon: CalendarIcon,
  },
  {
    value: MEMBERSHIP_TAB,
    label: 'Adhésions',
    href: '/parametres/adhesions',
    icon: MembershipIcon,
  },
  { value: CARD_TAB, label: 'Cartes', href: '/parametres/cartes', icon: CardIcon },
];

interface SettingsPageProps {
  tab: SettingsTab;
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
            {
              label: 'Nouveau modèle',
              icon: CardIcon,
              href: '/parametres/modeles/creation',
              fab: true,
            },
          ],
        },
      ]}
    >
      <Tabs value={tab} tabs={TABS} />
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
      {tab === CARD_TAB && (
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h6">Durée de validité</Typography>
            <CardSettingForm />
          </Stack>
          <Divider />
          <Stack spacing={2}>
            <Typography variant="h6">Modèles de cartes</Typography>
            <CardTemplateGrid />
          </Stack>
        </Stack>
      )}
    </PageLayout>
  );
};
