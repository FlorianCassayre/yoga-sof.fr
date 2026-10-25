import { listSchema } from './listSchema';
import { sortSchema } from './sortSchema';

export const createListSchema = <Columns extends Record<string, true>>(columns: Columns) =>
  listSchema.extend({
    sort: sortSchema(columns),
  });
