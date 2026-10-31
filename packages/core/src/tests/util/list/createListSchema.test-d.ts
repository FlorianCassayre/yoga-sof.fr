import type { usersTable } from '../../../features/auth/authTables';
import type { coursesTable } from '../../../features/course/coursesTable';
import { createListSchema } from '../../../util/list/createListSchema';

createListSchema<typeof coursesTable>({ capacity: true });
createListSchema<typeof usersTable>({ email: true });

// @ts-expect-error — a non-column key is rejected.
createListSchema<typeof coursesTable>({ bogus: true });

// @ts-expect-error — an omitted type parameter rejects every column.
createListSchema({ capacity: true });
