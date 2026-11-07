import type { Permission } from '@yoga-sof/core';

import { useCurrentUser } from './useCurrentUser';

export const useHasPermission = (permission: Permission): boolean => {
  const user = useCurrentUser();

  return user?.permissions.includes(permission) ?? false;
};
