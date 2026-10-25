import type { LucideIcon } from 'lucide-react';

export interface PageAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  fab?: boolean;
}

export interface PageActionGroup {
  title?: string;
  children: PageAction[];
}
