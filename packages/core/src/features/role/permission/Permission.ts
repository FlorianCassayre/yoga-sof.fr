export const PERMISSIONS = ['readData', 'manageData', 'manageSettings'] as const;

export type Permission = (typeof PERMISSIONS)[number];
