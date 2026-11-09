import { z } from 'zod';

import { listSchema, sortSchema } from '../../util/list';

export const courseUserWaitingListSubscribeSchema = z.object({
  courseId: z.coerce.number().int(),
  userId: z.string().min(1),
});

export const courseUserWaitingListUnsubscribeSchema = z.object({
  id: z.coerce.number().int(),
});

export const courseUserWaitingListListSchema = listSchema
  .extend({
    sort: sortSchema({
      createdAt: true,
      notifiedAt: true,
      userName: true,
      courseStartsAt: true,
    }),
  })
  .extend({
    courseId: z.number().int().optional(),
    userId: z.string().min(1).optional(),
  });
