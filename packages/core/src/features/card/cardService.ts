import { count, eq, getColumns } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { createRow, updateRow } from '../../db/rows';
import { assertConflict, assertFound, assertInput } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import type {
  cardCancelSchema,
  cardCreateSchema,
  cardEditSchema,
  cardGetSchema,
  cardListSchema,
} from './cardSchemas';
import { cardsTable } from './cardsTable';
import { cardValidUntil } from './cardValidUntil';
import { cardSettingsTable } from './settings/cardSettingsTable';
import { cardTemplatesTable } from './template/cardTemplatesTable';

const orderColumns = {
  userName: usersTable.name,
  type: cardsTable.type,
  price: cardsTable.price,
  remaining: cardsTable.remaining,
  validUntil: cardsTable.validUntil,
  createdAt: cardsTable.createdAt,
};

export const cardService = {
  list: async ({ sort, userId, ...params }: z.infer<typeof cardListSchema>, tx: DbTransaction) => {
    const filter = userId ? eq(cardsTable.userId, userId) : undefined;
    const { limit, offset } = pagination(params);

    const rows = await tx
      .select({
        id: cardsTable.id,
        userId: cardsTable.userId,
        userName: usersTable.name,
        type: cardsTable.type,
        price: cardsTable.price,
        count: cardsTable.count,
        remaining: cardsTable.remaining,
        validUntil: cardsTable.validUntil,
        createdAt: cardsTable.createdAt,
        canceled: cardsTable.canceled,
        canceledAt: cardsTable.canceledAt,
      })
      .from(cardsTable)
      .innerJoin(usersTable, eq(usersTable.id, cardsTable.userId))
      .where(filter)
      .orderBy(...sortOrders(orderColumns, sort))
      .limit(limit)
      .offset(offset);

    const [totals] = await tx.select({ total: count() }).from(cardsTable).where(filter);

    return { rows, total: totals?.total ?? 0 };
  },

  get: async ({ id }: z.infer<typeof cardGetSchema>, tx: DbTransaction) => {
    const canceler = alias(usersTable, 'canceler');

    const [row] = await tx
      .select({
        ...getColumns(cardsTable),
        userName: usersTable.name,
        canceledByName: canceler.name,
      })
      .from(cardsTable)
      .innerJoin(usersTable, eq(usersTable.id, cardsTable.userId))
      .leftJoin(canceler, eq(canceler.id, cardsTable.canceledBy))
      .where(eq(cardsTable.id, id));
    assertFound(row, 'La carte est introuvable.');

    return row;
  },

  create: async ({ userId, templateId }: z.infer<typeof cardCreateSchema>, tx: DbTransaction) => {
    const [template] = await tx
      .select()
      .from(cardTemplatesTable)
      .where(eq(cardTemplatesTable.id, templateId));
    assertFound(template, 'Le modèle de carte est introuvable.');

    const [user] = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    assertInput(user, "L'utilisateur est introuvable.");

    const [setting] = await tx.select().from(cardSettingsTable).limit(1);
    const validUntil = cardValidUntil({
      purchasedAt: new Date(),
      months: setting?.validityMonths ?? 12,
    });

    return createRow<typeof cardsTable.$inferSelect>(
      tx,
      cardsTable,
      {
        userId,
        templateId,
        type: template.type,
        price: template.price,
        count: template.count,
        remaining: template.count,
        validUntil,
      },
      'Création de la carte impossible.',
    );
  },

  update: (values: z.infer<typeof cardEditSchema>, tx: DbTransaction) =>
    updateRow<typeof cardsTable.$inferSelect>(
      tx,
      cardsTable,
      values,
      'La carte a été modifiée entre-temps, rechargez la page.',
    ),

  cancel: async (
    { id }: z.infer<typeof cardCancelSchema>,
    tx: DbTransaction,
    canceledBy: string,
  ) => {
    const [row] = await tx.select().from(cardsTable).where(eq(cardsTable.id, id));
    assertFound(row, 'La carte est introuvable.');
    assertConflict(!row.canceled, 'La carte est déjà annulée.');

    const changes = { canceled: true, canceledAt: new Date(), canceledBy };

    return updateRow<typeof cardsTable.$inferSelect>(
      tx,
      cardsTable,
      { id, version: row.version, ...changes },
      'La carte a été modifiée entre-temps, rechargez la page.',
    );
  },
};
