export const BREADCRUMB_BASE = [{
  title: 'Yoga Sof',
  pathname: '/administration',
}];

export const BREADCRUMB_OVERVIEW = [...BREADCRUMB_BASE, {
  title: 'Aperçu',
  pathname: '/administration',
}];

export const BREADCRUMB_CATEGORY_ADMINISTRATION = [...BREADCRUMB_BASE, {
  title: 'Administration',
}];

export const BREADCRUMB_ADMINS = [...BREADCRUMB_CATEGORY_ADMINISTRATION, {
  title: 'Administrateurs',
  pathname: '/administration/administrateurs',
}];

export const BREADCRUMB_USERS = [...BREADCRUMB_CATEGORY_ADMINISTRATION, {
  title: 'Utilisateurs',
  pathname: '/administration/utilisateurs',
}];

export const breadcrumbForUser = user => [...BREADCRUMB_USERS, {
  title: user.name,
  pathname: `/administration/users/${user.id}`,
}];

export const BREADCRUMB_CATEGORY_YOGA = [...BREADCRUMB_BASE, {
  title: 'Yoga',
}];

export const BREADCRUMB_SESSIONS = [...BREADCRUMB_CATEGORY_YOGA, {
  title: 'Séances',
  pathname: '/administration/seances',
}];

export const BREADCRUMB_SESSION_CREATE = [...BREADCRUMB_SESSIONS, {
  title: 'Création',
  pathname: '/administration/seances/creation',
}];
