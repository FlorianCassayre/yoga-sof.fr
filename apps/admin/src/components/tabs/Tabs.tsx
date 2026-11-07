'use client';

import { Tab, Tabs as MuiTabs } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AppRoute } from '../../routes';

export interface TabItem<K extends string> {
  value: K;
  label: ReactNode;
  icon?: LucideIcon;
  href?: AppRoute;
}

interface TabsProps<K extends string> {
  tabs: TabItem<K>[];
  value: K;
  onChange?: (value: K) => void;
}

export const Tabs = <K extends string>({ tabs, value, onChange }: TabsProps<K>) => {
  return (
    <MuiTabs value={value} onChange={(_, newValue: K) => onChange?.(newValue)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={Icon ? <Icon size={18} /> : undefined}
            iconPosition="start"
            {...(tab.href !== undefined ? { href: tab.href } : {})}
          />
        );
      })}
    </MuiTabs>
  );
};
