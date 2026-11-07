import type { RoleType } from '../type/RoleType';
import type { Permission } from './Permission';

export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  associate: ['adminPanel', 'readData'],
  manager: ['adminPanel', 'readData', 'manageData'],
  administrator: ['adminPanel', 'readData', 'manageData', 'manageSettings'],
};
