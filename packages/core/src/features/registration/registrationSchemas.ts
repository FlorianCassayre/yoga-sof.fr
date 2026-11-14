import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';

export const registrationListSchema = listSchema
  .extend({
    sort: sortSchema({
      createdAt: true,
      courseStartsAt: true,
      userName: true,
    }),
  })
  .extend({
    courseId: z.number().int().optional(),
    courseBundleId: z.number().int().optional(),
    userId: z.string().min(1).optional(),
  });

export const registrationCoursePresenceListSchema = listSchema.extend({
  courseId: z.coerce.number().int(),
  sort: sortSchema({
    createdAt: true,
    present: true,
    userName: true,
  }),
});

export const registrationEventListSchema = listSchema
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
    courseBundleId: z.number().int().optional(),
    userId: z.string().min(1).optional(),
  });

export const registrationCreateSchema = z
  .object({
    courses: z.array(z.object({ id: z.number().int() })).default([]),
    bundles: z.array(z.object({ id: z.number().int() })).default([]),
    users: z
      .array(z.object({ id: z.string().min(1) }))
      .min(1, 'Sélectionnez au moins un utilisateur.'),
    notify: z.boolean(),
  })
  .superRefine(({ courses, bundles }, ctx) => {
    if (courses.length === 0 && bundles.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['courses'],
        message: 'Sélectionnez au moins une séance ou un lot de séances.',
      });
    }
    if (courses.length > 0 && bundles.length > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['bundles'],
        message: 'Choisissez des séances ou des lots de séances, pas les deux.',
      });
    }
  })
  .transform(({ courses, bundles, users, notify }) => ({
    courseIds: courses.map((course) => course.id),
    bundleIds: bundles.map((bundle) => bundle.id),
    userIds: users.map((user) => user.id),
    notify,
  }));

export const registrationSetPresenceSchema = z.object({
  id: z.coerce.number().int(),
  courseId: z.coerce.number().int(),
  present: z.boolean().nullable(),
});

export const registrationPendingPresenceSchema = z.object({
  courseId: z.coerce.number().int(),
});
