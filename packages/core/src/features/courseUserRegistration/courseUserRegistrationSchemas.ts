import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';

export const courseUserRegistrationListSchema = listSchema
  .extend({
    sort: sortSchema({
      createdAt: true,
      courseStartsAt: true,
      userName: true,
    }),
  })
  .extend({
    courseId: z.number().int().optional(),
    userId: z.string().min(1).optional(),
  });

export const courseUserRegistrationEventListSchema = listSchema
  .extend({
    sort: sortSchema({
      date: true,
      type: true,
      userName: true,
      courseStartsAt: true,
    }),
  })
  .extend({
    courseId: z.number().int().optional(),
    userId: z.string().min(1).optional(),
  });

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
