export const PERMISSIONS = ['adminPanel', 'readData', 'manageData', 'manageSettings'] as const;

export type Permission = (typeof PERMISSIONS)[number];
