import { eq, inArray } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { ServiceError } from '../../../errors';
import { coursesTable } from '../../../features/course/coursesTable';
import { courseBundlesTable } from '../../../features/courseBundle/courseBundlesTable';
import { courseSuperBundleService } from '../../../features/courseSuperBundle/courseSuperBundleService';
import { courseSuperBundlesTable } from '../../../features/courseSuperBundle/courseSuperBundlesTable';
import { registerablesTable } from '../../../features/registerable/registerablesTable';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('courseSuperBundleService', () => {
  const bundleIds: number[] = [];
  let superBundleId: number | undefined;

  afterAll(async () => {
    await db
      .delete(registerablesTable)
      .where(inArray(registerablesTable.courseBundleId, bundleIds));
    await db.delete(courseBundlesTable).where(inArray(courseBundlesTable.id, bundleIds));
    if (superBundleId !== undefined) {
      await db.delete(courseSuperBundlesTable).where(eq(courseSuperBundlesTable.id, superBundleId));
    }
  });

  it('creates an ensemble with its bundles and registerables', async () => {
    const created = await withTransaction((tx) =>
      courseSuperBundleService.create(
        {
          label: 'Ensemble test',
          price: 25000,
          bundles: [
            { label: 'Lot 1', type: 'enfant', price: 15000, capacity: 10 },
            { label: 'Lot 2', type: 'enfant', price: 12000, capacity: 8 },
          ],
        },
        tx,
      ),
    );
    superBundleId = created.id;

    expect(created.bundleCount).toBe(2);
    expect(created.price).toBe(25000);

    const bundles = await db
      .select()
      .from(courseBundlesTable)
      .where(eq(courseBundlesTable.courseSuperBundleId, superBundleId));
    expect(bundles.map((bundle) => bundle.label).sort()).toEqual(['Lot 1', 'Lot 2']);
    bundleIds.push(...bundles.map((bundle) => bundle.id));

    const registerables = await db
      .select()
      .from(registerablesTable)
      .where(inArray(registerablesTable.courseBundleId, bundleIds));
    expect(
      registerables.map((registerable) => registerable.capacity).sort((a, b) => a - b),
    ).toEqual([8, 10]);
  });

  it('rejects an empty bundle list', async () => {
    await expect(
      withTransaction((tx) =>
        courseSuperBundleService.create({ label: 'Ensemble vide', price: 1000, bundles: [] }, tx),
      ),
    ).rejects.toThrow('Ajoutez au moins un lot de séances.');
  });

  it('rejects an individual-mode bundle type', async () => {
    await expect(
      withTransaction((tx) =>
        courseSuperBundleService.create(
          {
            label: 'Ensemble',
            price: 1000,
            bundles: [{ label: 'Lot', type: 'adulte', price: 1000, capacity: 5 }],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('Ce type de séance ne peut pas former de lot de séances.');
  });

  it('updates only on the current version', async () => {
    const updated = await withTransaction((tx) =>
      courseSuperBundleService.update(
        { id: superBundleId!, version: 1, label: 'Ensemble renommé' },
        tx,
      ),
    );
    expect(updated.label).toBe('Ensemble renommé');
    expect(updated.version).toBe(2);

    await expect(
      withTransaction((tx) =>
        courseSuperBundleService.update({ id: superBundleId!, version: 1, label: 'X' }, tx),
      ),
    ).rejects.toThrow(ServiceError);
  });

  it('gets the ensemble with its derived period', async () => {
    const [bundle] = await db
      .select()
      .from(courseBundlesTable)
      .where(eq(courseBundlesTable.courseSuperBundleId, superBundleId!));
    if (!bundle) {
      throw new Error('expected bundle to exist');
    }
    const [course] = await db
      .insert(coursesTable)
      .values({
        courseBundleId: bundle.id,
        startsAt: new Date('2030-05-06T08:00:00.000Z'),
        endsAt: new Date('2030-05-06T10:00:00.000Z'),
        visibility: 'public',
      })
      .returning();

    const row = await withTransaction((tx) =>
      courseSuperBundleService.get({ id: superBundleId! }, tx),
    );
    expect(row.startsAt).toEqual(new Date('2030-05-06T08:00:00.000Z'));

    await db.delete(coursesTable).where(eq(coursesTable.id, course!.id));
  });
});
