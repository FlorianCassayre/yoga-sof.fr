import type { MembershipType } from '@yoga-sof/core';
import type { LucideIcon } from 'lucide-react';
import { User, Users } from 'lucide-react';

export const MEMBERSHIP_TYPE_ICONS: Record<MembershipType, LucideIcon> = {
  individuelle: User,
  famille: Users,
};
