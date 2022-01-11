import { SESSIONS_TYPES } from './sessions';

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

const BREADCRUMB_SESSION_MODELS = [...BREADCRUMB_SESSIONS, {
  title: 'Modèles',
}];

export const BREADCRUMB_SESSION_CREATE = [...BREADCRUMB_SESSION_MODELS, {
  title: 'Création',
  pathname: '/administration/seances/modeles/creation',
}];

export const breadcrumbForSessionModelId = sessionId => [...BREADCRUMB_SESSION_MODELS, {
  title: `Séance "${SESSIONS_TYPES.filter(session => session.id === sessionId).map(({ title }) => title)[0]}"`,
  //pathname: `/administration/seances/modeles/${sessionId}`,
}];

export const breadcrumbForSessionModelIdEdit = sessionId => [...breadcrumbForSessionModelId(sessionId), {
  title: 'Edition',
  //pathname: `/administration/seances/modeles/${sessionId}/edition`,
}];

const BREADCRUMB_SESSION_PLANNING = [...BREADCRUMB_SESSIONS, {
  title: 'Planning',
}];

export const BREADCRUMB_SESSION_PLANNING_CREATE = [...BREADCRUMB_SESSION_PLANNING, {
  title: 'Création',
  pathname: '/administration/seances/planning/creation',
}];

export const breadcrumbForSessionPlanningId = sessionPlanningId => [...BREADCRUMB_SESSION_PLANNING, {
  title: `#${sessionPlanningId}`,
  //pathname: `/administration/seances/planning/${sessionId}`,
}];

export const breadcrumbForSessionPlanningIdEdit = sessionPlanningId => [...breadcrumbForSessionPlanningId(sessionPlanningId), {
  title: 'Edition',
  //pathname: `/administration/seances/planning/${sessionId}/edition`,
}];
