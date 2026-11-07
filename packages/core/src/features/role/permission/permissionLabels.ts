import type { Permission } from './Permission';

export const PERMISSION_LABELS: Record<Permission, string> = {
  adminPanel: 'Accès aux outils avancés de l’interface d’administration',
  readData: 'Accès en lecture à l’interface d’administration',
  manageData: 'Accès en écriture à l’interface d’administration',
  manageSettings: 'Accès en écriture aux outils avancés de l’interface d’administration',
};
