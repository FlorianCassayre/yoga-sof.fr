import { count, eq, getColumns, ilike, sql } from 'drizzle-orm';
import type { z } from 'zod';

import type { DbTransaction } from '../../db/db';
import { updateRow } from '../../db/rows';
import { assertFound, assertInput, assertState } from '../../errors';
import { pagination, sortOrders } from '../../util/list';
import { coursesTable } from '../course/coursesTable';
import { COURSE_TYPE_REGISTRATION_MODES } from '../course/type/courseRegistrationModes';
import { registerablesTable } from '../registerable/registerablesTable';
import type {
  courseBundleCreateSchema,
  courseBundleEditSchema,
  courseBundleGetSchema,
  courseBundleListSchema,
} from './courseBundleSchemas';
import { courseBundlesTable } from './courseBundlesTable';

const bundleRow = (tx: DbTransaction) =>
  tx
    .select({
      ...getColumns(courseBundlesTable),
      capacity: registerablesTable.capacity,
      registeredCount: registerablesTable.registeredCount,
      startsAt:
        sql<Date | null>`(SELECT min("courses"."startsAt") FROM "courses" WHERE "courses"."courseBundleId" = "course_bundles"."id")`.mapWith(
          coursesTable.startsAt,
        ),
      endsAt:
        sql<Date | null>`(SELECT max("courses"."endsAt") FROM "courses" WHERE "courses"."courseBundleId" = "course_bundles"."id")`.mapWith(
          coursesTable.endsAt,
        ),
    })
    .from(courseBundlesTable)
    .innerJoin(registerablesTable, eq(registerablesTable.courseBundleId, courseBundlesTable.id));

const LIST_ORDER_COLUMNS = {
  label: courseBundlesTable.label,
  price: courseBundlesTable.price,
  type: courseBundlesTable.type,
};

export const courseBundleService = {
  list: async (
    { sort, search, ...params }: z.infer<typeof courseBundleListSchema>,
    tx: DbTransaction,
  ) => {
    const { limit: paginationLimit, offset: paginationOffset } = pagination(params);
    const where = search === undefined ? undefined : ilike(courseBundlesTable.label, `%${search}%`);
    const rows = await tx
      .select({
        ...getColumns(courseBundlesTable),
        capacity: registerablesTable.capacity,
        courseCount: sql<number>`(SELECT count(*) FROM "courses" WHERE "courses"."courseBundleId" = "course_bundles"."id" AND NOT "courses"."canceled")`,
        startsAt:
          sql<Date | null>`(SELECT min("courses"."startsAt") FROM "courses" WHERE "courses"."courseBundleId" = "course_bundles"."id")`.mapWith(
            coursesTable.startsAt,
          ),
        endsAt:
          sql<Date | null>`(SELECT max("courses"."endsAt") FROM "courses" WHERE "courses"."courseBundleId" = "course_bundles"."id")`.mapWith(
            coursesTable.endsAt,
          ),
      })
      .from(courseBundlesTable)
      .innerJoin(registerablesTable, eq(registerablesTable.courseBundleId, courseBundlesTable.id))
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

  create: async (
    { label, type, price, capacity }: z.infer<typeof courseBundleCreateSchema>,
    tx: DbTransaction,
  ) => {
    assertInput(
      COURSE_TYPE_REGISTRATION_MODES[type] === 'bundle',
      'Ce type de séance ne peut pas former de lot de séances.',
    );
    const [bundle] = await tx.insert(courseBundlesTable).values({ label, type, price }).returning();
    assertState(bundle, 'Création du lot de séances impossible.');

    const [registerable] = await tx
      .insert(registerablesTable)
      .values({ courseBundleId: bundle.id, capacity })
      .returning();
    assertState(registerable, 'Création du lot de séances impossible.');

    const [row] = await bundleRow(tx).where(eq(courseBundlesTable.id, bundle.id));
    assertState(row, 'Création du lot de séances impossible.');

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
