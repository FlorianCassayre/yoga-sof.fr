import type { z } from 'zod';

import type { DbTransaction } from '../../../db/db';
import { createRow, updateRow } from '../../../db/rows';
import { assertConflict } from '../../../errors';
import type { cardSettingUpdateSchema } from './cardSettingSchemas';
import { cardSettingsTable } from './cardSettingsTable';

export const cardSettingService = {
  get: async (tx: DbTransaction) => {
    const [row] = await tx.select().from(cardSettingsTable).limit(1);

    return row ?? null;
  },

  update: async (
    { validityMonths, version }: z.infer<typeof cardSettingUpdateSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx.select().from(cardSettingsTable).limit(1).for('update');

    if (!row) {
      return createRow<typeof cardSettingsTable.$inferSelect>(
        tx,
        cardSettingsTable,
        { validityMonths },
        'Création de la configuration impossible.',
      );
    }

    assertConflict(
      version === undefined || row.version === version,
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );

    const changes = { validityMonths };

    return updateRow<typeof cardSettingsTable.$inferSelect>(
      tx,
      cardSettingsTable,
      { id: row.id, version: row.version, ...changes },
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );
  },
};
