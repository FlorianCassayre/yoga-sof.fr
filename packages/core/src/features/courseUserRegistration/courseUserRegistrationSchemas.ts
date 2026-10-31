import { z } from 'zod';

import { createListSchema } from '../../list';

const SORTABLE_COLUMNS = {
  createdAt: true,
  courseStartsAt: true,
  userName: true,
} as const;

export const courseUserRegistrationListSchema = createListSchema(SORTABLE_COLUMNS);

const EVENT_SORTABLE_COLUMNS = {
  date: true,
  type: true,
  userName: true,
  courseStartsAt: true,
} as const;

export const courseUserRegistrationEventListSchema = createListSchema(EVENT_SORTABLE_COLUMNS);

export const courseUserRegistrationCreateSchema = z
  .object({
    courses: z
      .array(z.object({ id: z.number().int() }))
      .min(1, 'Sélectionnez au moins une séance.'),
    users: z
      .array(z.object({ id: z.string().min(1) }))
      .min(1, 'Sélectionnez au moins un utilisateur.'),
    notify: z.boolean(),
  })
  .transform(({ courses, users, notify }) => ({
    courseIds: courses.map((course) => course.id),
    userIds: users.map((user) => user.id),
    notify,
  }));
