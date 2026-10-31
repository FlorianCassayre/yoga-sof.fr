import type { z } from 'zod';

import type { DbTransaction } from '../../../db/db';
import { createRow, updateRow } from '../../../db/rows';
import { assertConflict } from '../../../errors';
import type { membershipSettingUpdateSchema } from './membershipSettingSchemas';
import { membershipSettingsTable } from './membershipSettingsTable';

export const membershipSettingService = {
  get: async (tx: DbTransaction) => {
    const [row] = await tx.select().from(membershipSettingsTable).limit(1);

    return row ?? null;
  },

  update: async (
    { seasonStartMonth, version }: z.infer<typeof membershipSettingUpdateSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx.select().from(membershipSettingsTable).limit(1).for('update');

    if (!row) {
      return createRow<typeof membershipSettingsTable.$inferSelect>(
        tx,
        membershipSettingsTable,
        { seasonStartMonth },
        'Création de la configuration impossible.',
      );
    }

    assertConflict(
      version === undefined || row.version === version,
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );

    const changes = { seasonStartMonth };

    return updateRow<typeof membershipSettingsTable.$inferSelect>(
      tx,
      membershipSettingsTable,
      { id: row.id, version: row.version, ...changes },
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );
  },
};
