import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Permissions } from '../../common/role';

export const usePermission = (roles: UserRole[]): boolean => {
  const { data } = useSession();
  return data !== null && roles.includes(data.role);
};

export const useBackofficeWritePermission = () => usePermission(Permissions.WriteBackoffice);
