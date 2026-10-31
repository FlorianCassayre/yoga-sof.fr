import { and, asc, count, eq, inArray } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { createRow } from '../../db/rows';
import { assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrder } from '../../util/list';
import { usersTable } from '../auth/authTables';
import { membershipBeneficiariesTable } from './membershipBeneficiariesTable';
import type { membershipCreateSchema, membershipListSchema } from './membershipSchemas';
import { membershipSeasonPeriod } from './membershipSeasonPeriod';
import { membershipsTable } from './membershipsTable';
import { membershipPricesTable } from './price/membershipPricesTable';
import { membershipSettingsTable } from './settings/membershipSettingsTable';

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
      .orderBy(...sort.map((item) => sortOrder(membershipsTable, item)))
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
