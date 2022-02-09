import { formatTime, WEEKDAYS } from './date';
import { SESSIONS_TYPES } from './sessions';
import { renderSessionName } from './table';

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

export const BREADCRUMB_USER_CREATE = [...BREADCRUMB_USERS, {
  title: 'Création',
  pathname: '/administration/utilisateurs/creation',
}];

export const breadcrumbForUser = ({ name }) => [...BREADCRUMB_USERS, {
  title: name,
  //pathname: `/administration/utilisateurs/${userId}`,
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

export const breadcrumbForSessionModel = ({ type, weekday, time_start: timeStart, time_end: timeEnd }) => [...BREADCRUMB_SESSION_MODELS, {
  title: [SESSIONS_TYPES.filter(({ id }) => type === id)[0].title, 'les', WEEKDAYS[weekday].toLowerCase() + 's', 'de', formatTime(timeStart), 'à', formatTime(timeEnd)].join(' '),
  //pathname: `/administration/seances/modeles/${sessionId}`,
}];

export const breadcrumbForSessionModelEdit = obj => [...breadcrumbForSessionModel(obj), {
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

export const breadcrumbForSessionPlanning = obj => [...BREADCRUMB_SESSION_PLANNING, {
  title: renderSessionName(obj),
  //pathname: `/administration/seances/planning/${sessionId}`,
}];

export const breadcrumbForSessionPlanningEdit = obj => [...breadcrumbForSessionPlanning(obj), {
  title: 'Edition',
  //pathname: `/administration/seances/planning/${sessionId}/edition`,
}];

export const BREADCRUMB_EMAILS = [...BREADCRUMB_CATEGORY_ADMINISTRATION, {
  title: 'E-mails',
  pathname: '/administration/emails',
}];

export const BREADCRUMB_REGISTRATIONS = [...BREADCRUMB_CATEGORY_YOGA, {
  title: 'Inscriptions',
  pathname: '/administration/inscriptions',
}];

export const BREADCRUMB_REGISTRATIONS_CREATE = [...BREADCRUMB_REGISTRATIONS, {
  title: 'Création',
  pathname: '/administration/inscriptions/creation',
}];
