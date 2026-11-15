import { count, eq, getColumns, ilike, inArray, max, min, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { updateRow } from '../../db/rows';
import { assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { coursesTable } from '../course/coursesTable';
import { COURSE_TYPE_REGISTRATION_MODES } from '../course/type/courseRegistrationModes';
import { courseBundlesTable } from '../courseBundle/courseBundlesTable';
import { registerablesTable } from '../registerable/registerablesTable';
import type {
  courseSuperBundleCreateSchema,
  courseSuperBundleEditSchema,
  courseSuperBundleGetSchema,
  courseSuperBundleListSchema,
} from './courseSuperBundleSchemas';
import { courseSuperBundlesTable } from './courseSuperBundlesTable';

const aliasedBundles = alias(courseBundlesTable, 'member_bundles');

const memberBundleIds = (tx: DbTransaction) =>
  tx
    .select({ id: aliasedBundles.id })
    .from(aliasedBundles)
    .where(eq(aliasedBundles.courseSuperBundleId, courseSuperBundlesTable.id));

const superBundleRow = (tx: DbTransaction) =>
  tx
    .select({
      ...getColumns(courseSuperBundlesTable),
      bundleCount: sql<number>`${tx
        .select({ bundleCount: count() })
        .from(courseBundlesTable)
        .where(eq(courseBundlesTable.courseSuperBundleId, courseSuperBundlesTable.id))}`.mapWith(
        Number,
      ),
      startsAt: sql<Date | null>`${tx
        .select({ startsAt: min(coursesTable.startsAt) })
        .from(coursesTable)
        .where(inArray(coursesTable.courseBundleId, memberBundleIds(tx)))}`.mapWith(
        coursesTable.startsAt,
      ),
      endsAt: sql<Date | null>`${tx
        .select({ endsAt: max(coursesTable.endsAt) })
        .from(coursesTable)
        .where(inArray(coursesTable.courseBundleId, memberBundleIds(tx)))}`.mapWith(
        coursesTable.endsAt,
      ),
    })
    .from(courseSuperBundlesTable);

const LIST_ORDER_COLUMNS = {
  label: courseSuperBundlesTable.label,
  price: courseSuperBundlesTable.price,
};

export const courseSuperBundleService = {
  list: async (
    { sort, search, ...params }: z.infer<typeof courseSuperBundleListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where =
      search === undefined ? undefined : ilike(courseSuperBundlesTable.label, `%${search}%`);
    const rows = await superBundleRow(tx)
      .where(where)
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(courseSuperBundlesTable).where(where);

    return { rows, total: totals?.total ?? 0 };
  },

  get: async ({ id }: z.infer<typeof courseSuperBundleGetSchema>, tx: DbTransaction) => {
    const [row] = await superBundleRow(tx).where(eq(courseSuperBundlesTable.id, id));
    assertFound(row, "L'ensemble de lots de séances est introuvable.");

    return row;
  },

  create: async (
    { label, price, bundles }: z.infer<typeof courseSuperBundleCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(bundles.length > 0, 'Ajoutez au moins un lot de séances.');
    assertInput(
      bundles.every((bundle) => COURSE_TYPE_REGISTRATION_MODES[bundle.type] === 'bundle'),
      'Ce type de séance ne peut pas former de lot de séances.',
    );

    const [superBundle] = await tx
      .insert(courseSuperBundlesTable)
      .values({ label, price })
      .returning();
    assertState(superBundle, "Création de l'ensemble de lots de séances impossible.");

    for (const bundle of bundles) {
      const [row] = await tx
        .insert(courseBundlesTable)
        .values({ ...bundle, courseSuperBundleId: superBundle.id })
        .returning();
      assertState(row, 'Création du lot de séances impossible.');

      const [registerable] = await tx
        .insert(registerablesTable)
        .values({ courseBundleId: row.id, capacity: bundle.capacity })
        .returning();
      assertState(registerable, 'Création du lot de séances impossible.');
    }

    const [created] = await superBundleRow(tx).where(
      eq(courseSuperBundlesTable.id, superBundle.id),
    );
    assertState(created, "Création de l'ensemble de lots de séances impossible.");

    return created;
  },

  update: async (values: z.infer<typeof courseSuperBundleEditSchema>, tx: DbTransaction) => {
    const updated = await updateRow<typeof courseSuperBundlesTable.$inferSelect>(
      tx,
      courseSuperBundlesTable,
      values,
      "L'ensemble de lots de séances a été modifié entre-temps, rechargez la page.",
    );
    const [row] = await superBundleRow(tx).where(eq(courseSuperBundlesTable.id, updated.id));
    assertState(row, "L'ensemble de lots de séances est introuvable.");

    return row;
  },
};
