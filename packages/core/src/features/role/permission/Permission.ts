export const PERMISSIONS = ['adminPanel'] as const;

export type Permission = (typeof PERMISSIONS)[number];
