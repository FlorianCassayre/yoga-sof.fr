import { listSchema, sortSchema } from '../../util/list';

export const notificationListSchema = listSchema.extend({
  sort: sortSchema({
    courseStartsAt: true,
    courseType: true,
    date: true,
  }),
});
