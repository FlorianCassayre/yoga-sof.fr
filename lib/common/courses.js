export const YOGA_ADULT = 'YOGA_ADULT';
export const YOGA_CHILD = 'YOGA_CHILD';
export const YOGA_ADULT_CHILD = 'YOGA_ADULT_CHILD';

export const COURSE_TYPES = [
  {
    id: YOGA_ADULT,
    title: 'Yoga adulte',
  },
  {
    id: YOGA_CHILD,
    title: 'Yoga enfant',
  },
  {
    id: YOGA_ADULT_CHILD,
    title: 'Yoga parent-enfant',
  },
];

export const COURSE_NAMES = Object.fromEntries(COURSE_TYPES.map(({ id, title }) => [id, title]));
