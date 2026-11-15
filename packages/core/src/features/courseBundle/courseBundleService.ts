import { and, count, eq, getColumns, ilike, max, min, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { updateRow } from '../../db/rows';
import { assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { coursesTable } from '../course/coursesTable';
import { COURSE_TYPE_REGISTRATION_MODES } from '../course/type/courseRegistrationModes';
import { courseSuperBundlesTable } from '../courseSuperBundle/courseSuperBundlesTable';
import { registerablesTable } from '../registerable/registerablesTable';
import type {
  courseBundleEditSchema,
  courseBundleGetSchema,
  courseBundleListSchema,
} from './courseBundleSchemas';
import { courseBundlesTable } from './courseBundlesTable';

const aliasedSuperBundles = alias(courseSuperBundlesTable, 'super_bundles');

// The subqueries are built with the query builder and only glued with sql` —
// drizzle cannot embed a select in a select field.
const bundleRow = (tx: DbTransaction) =>
  tx
    .select({
      ...getColumns(courseBundlesTable),
      capacity: registerablesTable.capacity,
      registeredCount: registerablesTable.registeredCount,
      superBundleLabel: aliasedSuperBundles.label,
      courseCount: sql<number>`${tx
        .select({ courseCount: count() })
        .from(coursesTable)
        .where(
          and(
            eq(coursesTable.courseBundleId, courseBundlesTable.id),
            eq(coursesTable.canceled, false),
          ),
        )}`.mapWith(Number),
      startsAt: sql<Date | null>`${tx
        .select({ startsAt: min(coursesTable.startsAt) })
        .from(coursesTable)
        .where(eq(coursesTable.courseBundleId, courseBundlesTable.id))}`.mapWith(
        coursesTable.startsAt,
      ),
      endsAt: sql<Date | null>`${tx
        .select({ endsAt: max(coursesTable.endsAt) })
        .from(coursesTable)
        .where(eq(coursesTable.courseBundleId, courseBundlesTable.id))}`.mapWith(
        coursesTable.endsAt,
      ),
    })
    .from(courseBundlesTable)
    .innerJoin(registerablesTable, eq(registerablesTable.courseBundleId, courseBundlesTable.id))
    .leftJoin(
      aliasedSuperBundles,
      eq(aliasedSuperBundles.id, courseBundlesTable.courseSuperBundleId),
    );

const LIST_ORDER_COLUMNS = {
  label: courseBundlesTable.label,
  price: courseBundlesTable.price,
  type: courseBundlesTable.type,
};

export const courseBundleService = {
  list: async (
    { sort, search, courseSuperBundleId, ...params }: z.infer<typeof courseBundleListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where = and(
      search === undefined ? undefined : ilike(courseBundlesTable.label, `%${search}%`),
      courseSuperBundleId === undefined
        ? undefined
        : eq(courseBundlesTable.courseSuperBundleId, courseSuperBundleId),
    );
    const rows = await bundleRow(tx)
      .where(where)
      .orderBy(...sortOrders(LIST_ORDER_COLUMNS, sort))
      .limit(paginationLimit)
      .offset(paginationOffset);
    const [totals] = await tx.select({ total: count() }).from(courseBundlesTable).where(where);

    return { rows, total: totals?.total ?? 0 };
  },

  get: async ({ id }: z.infer<typeof courseBundleGetSchema>, tx: DbTransaction) => {
    const [row] = await bundleRow(tx).where(eq(courseBundlesTable.id, id));
    assertFound(row, 'Le lot de séances est introuvable.');

    return row;
  },

  update: async (values: z.infer<typeof courseBundleEditSchema>, tx: DbTransaction) => {
    const { capacity, ...bundleValues } = values;
    const { id } = bundleValues;
    assertInput(
      bundleValues.type === undefined ||
        COURSE_TYPE_REGISTRATION_MODES[bundleValues.type] === 'bundle',
      'Ce type de séance ne peut pas former de lot de séances.',
    );
    if (capacity !== undefined) {
      const [registerable] = await tx
        .select()
        .from(registerablesTable)
        .where(eq(registerablesTable.courseBundleId, id));
      assertState(registerable, 'Le lot de séances est introuvable.');
      assertInput(
        capacity >= registerable.registeredCount,
        "La capacité ne peut être inférieure au nombre d'inscrits.",
      );
      await tx
        .update(registerablesTable)
        .set({ capacity })
        .where(eq(registerablesTable.id, registerable.id));
    }

    const updated = await updateRow<typeof courseBundlesTable.$inferSelect>(
      tx,
      courseBundlesTable,
      bundleValues,
      'Le lot de séances a été modifié entre-temps, rechargez la page.',
    );
    const [row] = await bundleRow(tx).where(eq(courseBundlesTable.id, updated.id));
    assertState(row, 'Le lot de séances est introuvable.');

    return row;
  },
};
