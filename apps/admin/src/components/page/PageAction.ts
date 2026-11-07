import type { LucideIcon } from 'lucide-react';

import type { AppRoute } from '../../routes';

export interface PageAction {
  label: string;
  icon?: LucideIcon;
  href?: AppRoute;
  onClick?: () => void;
  disabled?: boolean;
  fab?: boolean;
}

export interface PageActionGroup {
  title?: string;
  children: PageAction[];
}
