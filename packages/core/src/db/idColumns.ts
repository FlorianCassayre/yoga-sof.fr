import { integer } from 'drizzle-orm/pg-core';

export const idColumns = {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
};
