export const COURSES_TABLE = 'course';
export const REGISTRATIONS_TABLE = 'course_registration';

export const COURSE_COLUMNS = {
  id: 0,
  type: 1,
  slots: 2,
  price: 3,
  date_start: 4,
  date_end: 5,
  is_canceled: 6,
  cancelation_reason: 7,
  notes: 8,
  created_at: 9,
  updated_at: 10,
  bundle_id: 11,
  visible: 12,
} as const;

export const REGISTRATION_COLUMNS = {
  id: 0,
  user_id: 1,
  course_id: 2,
  is_user_canceled: 3,
  reminder_sent: 4,
  created_at: 5,
  canceled_at: 6,
  attended: 7,
} as const;

export const COURSE_TYPES = {
  YOGA_ADULT: 'adulte',
  YOGA_CHILD: 'enfant',
} as const;
