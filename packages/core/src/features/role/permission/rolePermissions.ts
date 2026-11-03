import type { RoleType } from '../type/RoleType';
import type { Permission } from './Permission';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  associe: ['adminPanel'],
  gerant: ['adminPanel'],
  administrateur: ['adminPanel'],
};
