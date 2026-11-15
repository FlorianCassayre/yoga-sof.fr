import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../../db/db';
import { createRow, getRow, updateRow } from '../../../db/rows';
import { assertConflict, assertInput } from '../../../errors';
import { paginatedList } from '../../../util/list';
import { COURSE_TYPE_REGISTRATION_MODES } from '../../course/type/courseRegistrationModes';
import type {
  cardTemplateCreateSchema,
  cardTemplateDeleteSchema,
  cardTemplateEditSchema,
  cardTemplateGetSchema,
  cardTemplateListSchema,
} from './cardTemplateSchemas';
import { cardTemplatesTable } from './cardTemplatesTable';

export const cardTemplateService = {
  list: (input: z.infer<typeof cardTemplateListSchema>, tx: DbTransaction) =>
    paginatedList<typeof cardTemplatesTable.$inferSelect>(tx, cardTemplatesTable, input, {}),

  get: ({ id }: z.infer<typeof cardTemplateGetSchema>, tx: DbTransaction) =>
    getRow<typeof cardTemplatesTable.$inferSelect>(
      tx,
      cardTemplatesTable,
      id,
      'Le modèle de carte est introuvable',
    ),

  create: async (
    { type, price, count }: z.infer<typeof cardTemplateCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(
      COURSE_TYPE_REGISTRATION_MODES[type] === 'individual',
      'Les cartes ne peuvent pas porter sur un type de séances vendu uniquement en lot de séances.',
    );

    return createRow<typeof cardTemplatesTable.$inferSelect>(
      tx,
      cardTemplatesTable,
      { type, price, count },
      'Création du modèle impossible.',
    );
  },

  update: async (values: z.infer<typeof cardTemplateEditSchema>, tx: DbTransaction) => {
    if (values.type !== undefined) {
      assertInput(
        COURSE_TYPE_REGISTRATION_MODES[values.type] === 'individual',
        'Les cartes ne peuvent pas porter sur un type de séances vendu uniquement en lot de séances.',
      );
    }

    return updateRow<typeof cardTemplatesTable.$inferSelect>(
      tx,
      cardTemplatesTable,
      values,
      'Le modèle a été modifié entre-temps, rechargez la page.',
    );
  },

  delete: async ({ id, version }: z.infer<typeof cardTemplateDeleteSchema>, tx: DbTransaction) => {
    const [row] = await tx
      .delete(cardTemplatesTable)
      .where(and(eq(cardTemplatesTable.id, id), eq(cardTemplatesTable.version, version)))
      .returning();
    assertConflict(row, 'Le modèle a été modifié entre-temps, rechargez la page.');

    return row;
  },
};
