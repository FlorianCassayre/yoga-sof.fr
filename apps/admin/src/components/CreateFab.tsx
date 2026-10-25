'use client';

import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface CreateFabItem {
  icon: ReactNode;
  label: string;
  href: string;
}

interface CreateFabProps {
  items: CreateFabItem[];
}

export const CreateFab = ({ items }: CreateFabProps) => {
  return (
    <SpeedDial
      ariaLabel="Créer"
      sx={{ position: 'fixed', bottom: 24, right: 24 }}
      icon={<Plus size={22} />}
    >
      {items.map((item) => (
        <SpeedDialAction
          key={item.href}
          icon={item.icon}
          slotProps={{
            fab: { component: Link, href: item.href },
            tooltip: { title: item.label },
          }}
        />
      ))}
    </SpeedDial>
  );
};
