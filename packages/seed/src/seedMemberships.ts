import { faker } from '@faker-js/faker';
import {
  membershipBeneficiariesTable,
  membershipPricesTable,
  membershipSeasonPeriod,
  membershipSettingsTable,
  membershipsTable,
  type MembershipType,
} from '@yoga-sof/core';
import type { usersTable } from '@yoga-sof/core/server';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface SeedMembershipsParameters {
  users: (typeof usersTable.$inferSelect)[];
  admin: typeof usersTable.$inferSelect;
}

const INDIVIDUAL_PRICE_CENTS = 20000;
const FAMILY_PRICE_CENTS = 30000;

export async function seedMemberships(
  db: NodePgDatabase,
  { users, admin }: SeedMembershipsParameters,
) {
  await db.delete(membershipBeneficiariesTable);
  await db.delete(membershipsTable);
  await db.delete(membershipPricesTable);
  await db.delete(membershipSettingsTable);

  await db.insert(membershipPricesTable).values([
    { type: 'individuelle' as MembershipType, price: INDIVIDUAL_PRICE_CENTS },
    { type: 'famille' as MembershipType, price: FAMILY_PRICE_CENTS },
  ]);
  await db.insert(membershipSettingsTable).values({ seasonStartMonth: 9 });

  const now = new Date();
  const rows: (typeof membershipsTable.$inferInsert)[] = [];
  const specs: { type: MembershipType; userIds: string[] }[] = [];

  for (const year of [now.getFullYear() - 1, now.getFullYear()]) {
    const { startsAt, endsAt } = membershipSeasonPeriod({ year, month: 9 });
    const endsAtDate = new Date(`${endsAt}T12:00:00Z`);
    const createdAt = () =>
      faker.date.between({
        from: new Date(`${startsAt}T09:00:00Z`),
        to: endsAtDate > now ? now : endsAtDate,
      });

    const individualUsers = faker.helpers.arrayElements(users, Math.min(4, users.length));
    for (const user of individualUsers) {
      const emission = createdAt();
      const canceled = faker.helpers.maybe(() => true, { probability: 0.25 });
      rows.push({
        type: 'individuelle',
        price: INDIVIDUAL_PRICE_CENTS,
        startsAt,
        endsAt,
        createdAt: emission,
        ...(canceled
          ? {
              canceled: true,
              canceledAt: faker.date.between({ from: emission, to: now }),
              canceledBy: admin.id,
            }
          : {}),
      });
      specs.push({ type: 'individuelle', userIds: [user.id] });
    }

    const familyUsers = faker.helpers.arrayElements(users, Math.min(3, users.length));
    const familyEmission = createdAt();
    const familyCanceled = faker.helpers.maybe(() => true, { probability: 0.25 });
    rows.push({
      type: 'famille',
      price: FAMILY_PRICE_CENTS,
      startsAt,
      endsAt,
      createdAt: familyEmission,
      ...(familyCanceled
        ? {
            canceled: true,
            canceledAt: faker.date.between({ from: familyEmission, to: now }),
            canceledBy: admin.id,
          }
        : {}),
    });
    specs.push({ type: 'famille', userIds: familyUsers.map((user) => user.id) });
  }

  const inserted = await db.insert(membershipsTable).values(rows).returning();
  await db
    .insert(membershipBeneficiariesTable)
    .values(
      inserted.flatMap((membership, index) =>
        specs[index]!.userIds.map((userId) => ({ membershipId: membership.id, userId })),
      ),
    );

  console.log(`Seeded ${inserted.length} memberships!`);
}
