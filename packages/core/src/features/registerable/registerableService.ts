import { and, eq, sql } from 'drizzle-orm';

import type { DbTransaction } from '../../db/db';
import { assertConflict } from '../../errors';
import { registerablesTable } from './registerablesTable';

export const registerableService = {
  reserve: async (seats: { id: number; message: string }[], tx: DbTransaction): Promise<void> => {
    for (const { id, message } of [...seats].sort((a, b) => a.id - b.id)) {
      const [row] = await tx
        .select({ id: registerablesTable.id })
        .from(registerablesTable)
        .where(
          and(
            eq(registerablesTable.id, id),
            sql`${registerablesTable.registeredCount} < ${registerablesTable.capacity}`,
          ),
        )
        .for('update');
      assertConflict(row, message);

      await tx
        .update(registerablesTable)
        .set({ registeredCount: sql`${registerablesTable.registeredCount} + 1` })
        .where(eq(registerablesTable.id, id));
    }
  },
};
