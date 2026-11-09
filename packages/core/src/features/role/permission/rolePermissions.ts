import type { RoleType } from '../type/RoleType';
import type { Permission } from './Permission';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  associate: ['readData'],
  manager: ['readData', 'manageData'],
  administrator: ['readData', 'manageData', 'manageSettings'],
};
