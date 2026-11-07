import { and, asc, count, eq, getColumns, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { createRow, updateRow } from '../../db/rows';
import { assertConflict, assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { membershipBeneficiariesTable } from './membershipBeneficiariesTable';
import type {
  membershipCancelSchema,
  membershipCreateSchema,
  membershipEditSchema,
  membershipGetSchema,
  membershipListSchema,
} from './membershipSchemas';
import { membershipSeasonPeriod } from './membershipSeasonPeriod';
import { membershipsTable } from './membershipsTable';
import { membershipPricesTable } from './price/membershipPricesTable';
import { membershipSettingsTable } from './settings/membershipSettingsTable';

const listBeneficiaries = (tx: DbTransaction, membershipId: number) =>
  tx
    .select({ id: usersTable.id, name: usersTable.name })
    .from(membershipBeneficiariesTable)
    .innerJoin(usersTable, eq(usersTable.id, membershipBeneficiariesTable.userId))
    .where(eq(membershipBeneficiariesTable.membershipId, membershipId))
    .orderBy(asc(usersTable.name));

export const membershipService = {
  list: async (
    { sort, userId, ...params }: z.infer<typeof membershipListSchema>,
    tx: DbTransaction,
  ) => {
    // Memberships the given user is a beneficiary of.
    const membershipFilter = userId
      ? inArray(
          membershipsTable.id,
          tx
            .select({ id: membershipBeneficiariesTable.membershipId })
            .from(membershipBeneficiariesTable)
            .where(eq(membershipBeneficiariesTable.userId, userId)),
        )
      : undefined;

    const { limit, offset } = pagination(params);

    const rows = await tx
      .select({
        id: membershipsTable.id,
        type: membershipsTable.type,
        price: membershipsTable.price,
        startsAt: membershipsTable.startsAt,
        endsAt: membershipsTable.endsAt,
        createdAt: membershipsTable.createdAt,
      })
      .from(membershipsTable)
      .where(membershipFilter)
      .orderBy(...sortOrders(getColumns(membershipsTable), sort))
      .limit(limit)
      .offset(offset);

    const beneficiaries = rows.length
      ? await tx
          .select({
            membershipId: membershipBeneficiariesTable.membershipId,
            userId: membershipBeneficiariesTable.userId,
            userName: usersTable.name,
          })
          .from(membershipBeneficiariesTable)
          .innerJoin(usersTable, eq(usersTable.id, membershipBeneficiariesTable.userId))
          .where(
            inArray(
              membershipBeneficiariesTable.membershipId,
              rows.map((row) => row.id),
            ),
          )
          .orderBy(asc(usersTable.name))
      : [];

    const [totals] = await tx
      .select({ total: count() })
      .from(membershipsTable)
      .where(membershipFilter);

    return {
      rows: rows.map((row) => ({
        ...row,
        beneficiaries: beneficiaries.filter((beneficiary) => beneficiary.membershipId === row.id),
      })),
      total: totals?.total ?? 0,
    };
  },

  get: async ({ id }: z.infer<typeof membershipGetSchema>, tx: DbTransaction) => {
    const canceler = alias(usersTable, 'canceler');

    const [row] = await tx
      .select({ ...getColumns(membershipsTable), canceledByName: canceler.name })
      .from(membershipsTable)
      .leftJoin(canceler, eq(canceler.id, membershipsTable.canceledBy))
      .where(eq(membershipsTable.id, id));
    assertFound(row, "L'adhésion est introuvable.");

    const beneficiaries = await listBeneficiaries(tx, id);

    return { ...row, beneficiaries };
  },

  update: async (
    { id, version, userIds }: z.infer<typeof membershipEditSchema>,
    tx: DbTransaction,
  ) => {
    const [row] = await tx.select().from(membershipsTable).where(eq(membershipsTable.id, id));
    assertFound(row, "L'adhésion est introuvable.");
    assertConflict(!row.canceled, "L'adhésion est annulée.");

    assertInput(
      new Set(userIds).size === userIds.length,
      'Les bénéficiaires doivent être distincts.',
    );

    const existing = await listBeneficiaries(tx, id);
    const existingIds = existing.map((beneficiary) => beneficiary.id);
    assertInput(
      existingIds.every((existingId) => userIds.includes(existingId)),
      'Les bénéficiaires existants ne peuvent pas être retirés.',
    );

    const additions = userIds.filter((userId) => !existingIds.includes(userId));
    assertInput(
      row.type !== 'individuelle' || additions.length === 0,
      "Une adhésion individuelle ne compte qu'un seul bénéficiaire.",
    );

    if (additions.length) {
      const userRows = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(inArray(usersTable.id, additions));
      assertInput(
        userRows.length === additions.length,
        'Certains bénéficiaires sont introuvables.',
      );

      await tx
        .insert(membershipBeneficiariesTable)
        .values(additions.map((userId) => ({ membershipId: id, userId })))
        .onConflictDoNothing();
    }

    const updated = await updateRow<typeof membershipsTable.$inferSelect>(
      tx,
      membershipsTable,
      { id, version },
      "L'adhésion a été modifiée entre-temps, rechargez la page.",
    );

    return { ...updated, beneficiaries: await listBeneficiaries(tx, id) };
  },

  cancel: async (
    { id }: z.infer<typeof membershipCancelSchema>,
    tx: DbTransaction,
    canceledBy: string,
  ) => {
    const [row] = await tx.select().from(membershipsTable).where(eq(membershipsTable.id, id));
    assertFound(row, "L'adhésion est introuvable.");
    assertConflict(!row.canceled, "L'adhésion est déjà annulée.");

    const changes = { canceled: true, canceledAt: new Date(), canceledBy };

    return updateRow<typeof membershipsTable.$inferSelect>(
      tx,
      membershipsTable,
      { id, version: row.version, ...changes },
      "L'adhésion a été modifiée entre-temps, rechargez la page.",
    );
  },

  create: async (
    { type, year, userIds }: z.infer<typeof membershipCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(
      new Set(userIds).size === userIds.length,
      'Les bénéficiaires doivent être distincts.',
    );
    assertInput(
      type !== 'individuelle' || userIds.length === 1,
      "L'adhésion individuelle requiert exactement un bénéficiaire.",
    );

    const userRows = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.id, userIds));
    assertInput(userRows.length === userIds.length, 'Certains bénéficiaires sont introuvables.');

    const [setting] = await tx.select().from(membershipSettingsTable).limit(1);
    assertState(setting, "La configuration des adhésions n'a pas été définie.");

    const { startsAt, endsAt } = membershipSeasonPeriod({ year, month: setting.seasonStartMonth });

    if (type === 'individuelle') {
      const [existing] = await tx
        .select({ id: membershipsTable.id })
        .from(membershipsTable)
        .innerJoin(
          membershipBeneficiariesTable,
          eq(membershipBeneficiariesTable.membershipId, membershipsTable.id),
        )
        .where(
          and(
            eq(membershipsTable.type, type),
            eq(membershipsTable.startsAt, startsAt),
            eq(membershipsTable.endsAt, endsAt),
            inArray(membershipBeneficiariesTable.userId, userIds),
          ),
        );
      assertInput(
        existing === undefined,
        'Le bénéficiaire a déjà une adhésion individuelle pour cette période.',
      );
    }

    const [priceRow] = await tx
      .select()
      .from(membershipPricesTable)
      .where(eq(membershipPricesTable.type, type));
    assertFound(priceRow, "Aucun tarif n'est configuré pour ce type d'adhésion.");

    const membership = await createRow<typeof membershipsTable.$inferSelect>(
      tx,
      membershipsTable,
      { type, price: priceRow.price, startsAt, endsAt },
      "Création de l'adhésion impossible.",
    );

    await tx
      .insert(membershipBeneficiariesTable)
      .values(userIds.map((userId) => ({ membershipId: membership.id, userId })));

    return membership;
  },
};
