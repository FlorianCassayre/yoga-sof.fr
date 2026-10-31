import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../../db/db';
import { createRow, getRow, updateRow } from '../../../db/rows';
import { assertConflict } from '../../../errors';
import { paginatedList } from '../../../util/list';
import type {
  membershipPriceCreateSchema,
  membershipPriceDeleteSchema,
  membershipPriceEditSchema,
  membershipPriceGetSchema,
  membershipPriceListSchema,
} from './membershipPriceSchemas';
import { membershipPricesTable } from './membershipPricesTable';

export const membershipPriceService = {
  list: (input: z.infer<typeof membershipPriceListSchema>, tx: DbTransaction) =>
    paginatedList<typeof membershipPricesTable.$inferSelect>(tx, membershipPricesTable, input, {}),

  get: ({ id }: z.infer<typeof membershipPriceGetSchema>, tx: DbTransaction) =>
    getRow<typeof membershipPricesTable.$inferSelect>(
      tx,
      membershipPricesTable,
      id,
      'Le tarif est introuvable',
    ),

  create: async (
    { type, price }: z.infer<typeof membershipPriceCreateSchema>,
    tx: DbTransaction,
  ) => {
    const [existing] = await tx
      .select({ id: membershipPricesTable.id })
      .from(membershipPricesTable)
      .where(eq(membershipPricesTable.type, type));
    assertConflict(existing === undefined, "Un tarif existe déjà pour ce type d'adhésion.");

    return createRow<typeof membershipPricesTable.$inferSelect>(
      tx,
      membershipPricesTable,
      { type, price },
      'Création du tarif impossible.',
    );
  },

  update: async (values: z.infer<typeof membershipPriceEditSchema>, tx: DbTransaction) => {
    const { id, type } = values;
    if (type !== undefined) {
      const [existing] = await tx
        .select({ id: membershipPricesTable.id })
        .from(membershipPricesTable)
        .where(eq(membershipPricesTable.type, type));
      assertConflict(
        existing === undefined || existing.id === id,
        "Un tarif existe déjà pour ce type d'adhésion.",
      );
    }

    return updateRow<typeof membershipPricesTable.$inferSelect>(
      tx,
      membershipPricesTable,
      values,
      'Le tarif a été modifié entre-temps, rechargez la page.',
    );
  },

  delete: async (
    { id, version }: z.infer<typeof membershipPriceDeleteSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx
      .delete(membershipPricesTable)
      .where(and(eq(membershipPricesTable.id, id), eq(membershipPricesTable.version, version)))
      .returning();
    assertConflict(row, 'Le tarif a été modifié entre-temps, rechargez la page.');

    return row;
  },
};
