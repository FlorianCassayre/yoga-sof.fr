import { customType } from 'drizzle-orm/pg-core';

// Binary data; node-postgres maps bytea to and from Buffer.
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});
