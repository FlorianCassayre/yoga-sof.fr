import type { z } from 'zod';

import type { DbTransaction } from '../../../db/db';
import { createRow, updateRow } from '../../../db/rows';
import { assertConflict } from '../../../errors';
import type { calendarSettingUpdateSchema } from './calendarSettingSchemas';
import { calendarSettingsTable } from './calendarSettingsTable';

export const calendarSettingService = {
  get: async (tx: DbTransaction) => {
    const [row] = await tx.select().from(calendarSettingsTable).limit(1);

    return row ?? null;
  },

  update: async (
    { dayStartsAt, dayEndsAt, version }: z.infer<typeof calendarSettingUpdateSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx.select().from(calendarSettingsTable).limit(1).for('update');

    if (!row) {
      return createRow<typeof calendarSettingsTable.$inferSelect>(
        tx,
        calendarSettingsTable,
        { dayStartsAt, dayEndsAt },
        'Création de la configuration impossible.',
      );
    }

    assertConflict(
      version === undefined || row.version === version,
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );

    const changes = { dayStartsAt, dayEndsAt };

    return updateRow<typeof calendarSettingsTable.$inferSelect>(
      tx,
      calendarSettingsTable,
      { id: row.id, version: row.version, ...changes },
      'La configuration a été modifiée entre-temps, rechargez la page.',
    );
  },
};
