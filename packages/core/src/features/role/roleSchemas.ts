import { listSchema, sortSchema } from '../../util/list';

export const roleListSchema = listSchema.extend({
  sort: sortSchema({
    userName: true,
    role: true,
  }),
});
