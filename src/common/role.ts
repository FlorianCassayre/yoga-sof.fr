import { UserRole } from '@prisma/client';

export const RoleNames: { [K in UserRole]: string } = {
  [UserRole.ADMINISTRATOR]: 'Administrateur',
  [UserRole.MANAGER]: 'Gérant',
  [UserRole.ASSOCIATE]: 'Associé',
  [UserRole.MEMBER]: 'Membre'
};

const PERMISSION_ADMIN: UserRole[] = [UserRole.ADMINISTRATOR];
const PERMISSION_WRITE_BACKOFFICE: UserRole[] = [...PERMISSION_ADMIN, UserRole.MANAGER];
const PERMISSION_READ_BACKOFFICE: UserRole[] = [...PERMISSION_WRITE_BACKOFFICE, UserRole.ASSOCIATE];
const PERMISSION_DEFAULT: UserRole[] = [...PERMISSION_READ_BACKOFFICE, UserRole.MEMBER];

export const Permissions = {
  Admin: PERMISSION_ADMIN,
  WriteBackoffice: PERMISSION_WRITE_BACKOFFICE,
  ReadBackoffice: PERMISSION_READ_BACKOFFICE,
  ReadCoachCalendar: PERMISSION_READ_BACKOFFICE,
  Default: PERMISSION_DEFAULT,
  DisableableUser: PERMISSION_ADMIN,
} satisfies Record<string, UserRole[]>;

export const PermissionNames: Record<keyof typeof Permissions, string> = {
  Admin: `Accès aux outils avancées de l'interface d'administration`,
  WriteBackoffice: `Accès en écrire à l'interface d'administration`,
  ReadBackoffice: `Accès en lecture à l'interface d'administration`,
  ReadCoachCalendar: `Accès en lecture au calendrier d'enseignant depuis une application tierce`,
  Default: `Accès au site principal et à la page personnelle`,
  DisableableUser: `Protection contre la suppression utilisateur`,
};
