import { COURSE_NAMES, WEEKDAYS, displayBundleName, displayCourseName, displayUserName, formatTime } from '../common';

export const BREADCRUMB_BASE = [
  {
    title: 'Yoga Sof',
    pathname: '/administration',
  },
];

export const BREADCRUMB_OVERVIEW = [
  ...BREADCRUMB_BASE,
  {
    title: 'Aperçu',
    pathname: '/administration',
  },
];

export const BREADCRUMB_CATEGORY_ADMINISTRATION = [
  ...BREADCRUMB_BASE,
  { title: 'Administration' },
];

export const BREADCRUMB_ADMINS = [
  ...BREADCRUMB_CATEGORY_ADMINISTRATION,
  {
    title: 'Administrateurs',
    pathname: '/administration/administrateurs',
  },
];

export const BREADCRUMB_USERS = [
  ...BREADCRUMB_CATEGORY_ADMINISTRATION,
  {
    title: 'Utilisateurs',
    pathname: '/administration/utilisateurs',
  },
];

export const BREADCRUMB_USER_CREATE = [
  ...BREADCRUMB_USERS,
  {
    title: 'Création',
    pathname: '/administration/utilisateurs/creation',
  },
];

export const breadcrumbForUser = data => [
  ...BREADCRUMB_USERS,
  {
    title: displayUserName(data),
    // pathname: `/administration/utilisateurs/${userId}`,
  },
];

export const BREADCRUMB_CATEGORY_YOGA = [
  ...BREADCRUMB_BASE,
  { title: 'Yoga' },
];

export const BREADCRUMB_COURSES = [
  ...BREADCRUMB_CATEGORY_YOGA,
  {
    title: 'Séances',
    pathname: '/administration/seances',
  },
];

const BREADCRUMB_COURSE_MODELS = [
  ...BREADCRUMB_COURSES,
  { title: 'Modèles' },
];

export const BREADCRUMB_COURSE_CREATE = [
  ...BREADCRUMB_COURSE_MODELS,
  {
    title: 'Création',
    pathname: '/administration/seances/modeles/creation',
  },
];

export const breadcrumbForCourseModel = ({ type, weekday, timeStart, timeEnd }) => [
  ...BREADCRUMB_COURSE_MODELS,
  {
    title: [COURSE_NAMES[type], 'les', `${WEEKDAYS[weekday].toLowerCase()}s`, 'de', formatTime(timeStart), 'à', formatTime(timeEnd)].join(' '),
    // pathname: `/administration/seances/modeles/${courseId}`,
  },
];

export const breadcrumbForCourseModelEdit = obj => [
  ...breadcrumbForCourseModel(obj),
  {
    title: 'Edition',
    // pathname: `/administration/seances/modeles/${courseId}/edition`,
  },
];

const BREADCRUMB_COURSE_PLANNING = [
  ...BREADCRUMB_COURSES,
  { title: 'Planning' },
];

export const BREADCRUMB_COURSE_PLANNING_CREATE = [
  ...BREADCRUMB_COURSE_PLANNING,
  {
    title: 'Création',
    pathname: '/administration/seances/planning/creation',
  },
];

export const breadcrumbForCoursePlanning = obj => [
  ...BREADCRUMB_COURSE_PLANNING,
  {
    title: displayCourseName(obj),
    // pathname: `/administration/seances/planning/${courseId}`,
  },
];

export const breadcrumbForCoursePlanningEdit = obj => [
  ...breadcrumbForCoursePlanning(obj),
  {
    title: 'Edition',
    // pathname: `/administration/seances/planning/${courseId}/edition`,
  },
];

const BREADCRUMB_COURSE_BUNDLES = [
  ...BREADCRUMB_COURSES,
  { title: 'Lots' },
];

export const breadcrumbForBundle = obj => [
  ...BREADCRUMB_COURSE_BUNDLES,
  {
    title: displayBundleName(obj),
    // pathname: `/administration/seances/planning/${courseId}/edition`,
  },
];

export const breadcrumbForBundleEdit = obj => [
  ...breadcrumbForBundle(obj),
  {
    title: displayBundleName(obj),
    // pathname: `/administration/seances/lots/${obj.id}/edition`,
  },
];

export const BREADCRUMB_EMAILS = [
  ...BREADCRUMB_CATEGORY_ADMINISTRATION,
  {
    title: 'E-mails',
    pathname: '/administration/emails',
  },
];

export const BREADCRUMB_REGISTRATIONS = [
  ...BREADCRUMB_CATEGORY_YOGA,
  {
    title: 'Inscriptions',
    pathname: '/administration/inscriptions',
  },
];

export const BREADCRUMB_REGISTRATIONS_CREATE = [
  ...BREADCRUMB_REGISTRATIONS,
  {
    title: 'Création',
    pathname: '/administration/inscriptions/creation',
  },
];
