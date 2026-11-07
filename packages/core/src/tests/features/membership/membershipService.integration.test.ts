import { eq, like } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { usersTable } from '../../../features/auth/authTables';
import { membershipBeneficiariesTable } from '../../../features/membership/membershipBeneficiariesTable';
import { membershipService } from '../../../features/membership/membershipService';
import { membershipsTable } from '../../../features/membership/membershipsTable';
import { membershipPriceService } from '../../../features/membership/price/membershipPriceService';
import { membershipPricesTable } from '../../../features/membership/price/membershipPricesTable';
import { membershipSettingService } from '../../../features/membership/settings/membershipSettingService';
import { membershipSettingsTable } from '../../../features/membership/settings/membershipSettingsTable';

const EMAIL_SUFFIX = 'membership-service-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('membershipService', () => {
  let beneficiaryId = '';
  let otherId = '';
  let thirdId = '';
  let cancelerId = '';

  const clearUsers = () => db.delete(usersTable).where(like(usersTable.email, `%${EMAIL_SUFFIX}`));

  const createMembership = async (type: 'individuelle' | 'famille', userIds: string[]) => {
    const membership = await withTransaction((tx) =>
      membershipService.create({ type, year: 2026, userIds }, tx),
    );
    if (!membership) {
      throw new Error('expected membership to be created');
    }

    return membership;
  };

  beforeAll(async () => {
    await clearUsers();
    await db.delete(membershipPricesTable);
    await db.delete(membershipSettingsTable);

    const [beneficiary, other, third, canceler] = await db
      .insert(usersTable)
      .values([
        { email: `beneficiary-${EMAIL_SUFFIX}`, name: 'Bénéficiaire Test' },
        { email: `other-${EMAIL_SUFFIX}`, name: 'Autre Test' },
        { email: `third-${EMAIL_SUFFIX}`, name: 'Troisième Test' },
        { email: `canceler-${EMAIL_SUFFIX}`, name: 'Annuleur Test' },
      ])
      .returning();
    if (!beneficiary || !other || !third || !canceler) {
      throw new Error('expected users to be created');
    }
    beneficiaryId = beneficiary.id;
    otherId = other.id;
    thirdId = third.id;
    cancelerId = canceler.id;

    const price = await withTransaction((tx) =>
      membershipPriceService.create({ type: 'famille', price: 30000 }, tx),
    );
    if (!price) {
      throw new Error('expected price to be created');
    }
    await withTransaction((tx) =>
      membershipPriceService.create({ type: 'individuelle', price: 20000 }, tx),
    );

    await withTransaction((tx) => membershipSettingService.update({ seasonStartMonth: 9 }, tx));
  });

  afterAll(async () => {
    await db.delete(membershipsTable);
    await db.delete(membershipPricesTable);
    await db.delete(membershipSettingsTable);
    await clearUsers();
    await db.$client.end();
  });

  it('creates a membership and fetches it with its beneficiaries', async () => {
    const membership = await createMembership('famille', [beneficiaryId, otherId]);
    expect(membership.type).toBe('famille');
    expect(membership.price).toBe(30000);
    expect(membership.canceled).toBe(false);
    expect(membership.version).toBe(1);

    const fetched = await withTransaction((tx) => membershipService.get({ id: membership.id }, tx));
    expect(fetched.beneficiaries).toHaveLength(2);
    expect(fetched.beneficiaries.map((beneficiary) => beneficiary.id)).toEqual([
      otherId,
      beneficiaryId,
    ]);
    expect(fetched.canceledByName).toBeNull();
  });

  it('adds beneficiaries without removing existing ones', async () => {
    const membership = await createMembership('famille', [beneficiaryId, otherId]);

    const updated = await withTransaction((tx) =>
      membershipService.update(
        {
          id: membership.id,
          version: membership.version,
          userIds: [otherId, beneficiaryId, thirdId],
        },
        tx,
      ),
    );
    expect(updated.version).toBe(membership.version + 1);
    expect(updated.beneficiaries.map((beneficiary) => beneficiary.id)).toEqual([
      otherId,
      beneficiaryId,
      thirdId,
    ]);

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          { id: membership.id, version: updated.version, userIds: [beneficiaryId] },
          tx,
        ),
      ),
    ).rejects.toThrow('Les bénéficiaires existants ne peuvent pas être retirés.');

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          { id: membership.id, version: updated.version, userIds: [beneficiaryId, beneficiaryId] },
          tx,
        ),
      ),
    ).rejects.toThrow('Les bénéficiaires doivent être distincts.');

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          {
            id: membership.id,
            version: updated.version,
            userIds: [otherId, beneficiaryId, thirdId, 'missing-user'],
          },
          tx,
        ),
      ),
    ).rejects.toThrow('Certains bénéficiaires sont introuvables.');

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          {
            id: membership.id,
            version: 0,
            userIds: [otherId, beneficiaryId, thirdId],
          },
          tx,
        ),
      ),
    ).rejects.toThrow("L'adhésion a été modifiée entre-temps, rechargez la page.");
  });

  it('refuses to add beneficiaries to an individual membership', async () => {
    const membership = await createMembership('individuelle', [beneficiaryId]);

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          { id: membership.id, version: membership.version, userIds: [beneficiaryId, otherId] },
          tx,
        ),
      ),
    ).rejects.toThrow("Une adhésion individuelle ne compte qu'un seul bénéficiaire.");
  });

  it('cancels a membership once, recording the canceler', async () => {
    const membership = await createMembership('famille', [beneficiaryId]);

    const canceled = await withTransaction((tx) =>
      membershipService.cancel({ id: membership.id }, tx, cancelerId),
    );
    expect(canceled.canceled).toBe(true);
    expect(canceled.canceledAt).not.toBeNull();
    expect(canceled.canceledBy).toBe(cancelerId);
    expect(canceled.version).toBe(membership.version + 1);

    const fetched = await withTransaction((tx) => membershipService.get({ id: membership.id }, tx));
    expect(fetched.canceledByName).toBe('Annuleur Test');

    await expect(
      withTransaction((tx) => membershipService.cancel({ id: membership.id }, tx, cancelerId)),
    ).rejects.toThrow("L'adhésion est déjà annulée.");

    await expect(
      withTransaction((tx) =>
        membershipService.update(
          { id: membership.id, version: canceled.version, userIds: [otherId] },
          tx,
        ),
      ),
    ).rejects.toThrow("L'adhésion est annulée.");
  });

  it('deletes beneficiaries when the membership is deleted', async () => {
    const membership = await createMembership('famille', [beneficiaryId]);

    await db.delete(membershipsTable).where(eq(membershipsTable.id, membership.id));

    const remaining = await db
      .select({ userId: membershipBeneficiariesTable.userId })
      .from(membershipBeneficiariesTable)
      .where(eq(membershipBeneficiariesTable.membershipId, membership.id));
    expect(remaining).toHaveLength(0);
  });
});
