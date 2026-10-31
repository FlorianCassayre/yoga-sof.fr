import { faker } from '@faker-js/faker';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { usersTable } from '../features/auth/authTables';
import {
  membershipBeneficiariesTable,
  membershipPricesTable,
  membershipSeasonPeriod,
  membershipSettingsTable,
  membershipsTable,
  type MembershipType,
} from '../features/membership';

interface SeedMembershipsParameters {
  users: (typeof usersTable.$inferSelect)[];
}

const INDIVIDUAL_PRICE_CENTS = 20000;
const FAMILY_PRICE_CENTS = 30000;

export async function seedMemberships(db: NodePgDatabase, { users }: SeedMembershipsParameters) {
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
      rows.push({
        type: 'individuelle',
        price: INDIVIDUAL_PRICE_CENTS,
        startsAt,
        endsAt,
        createdAt: createdAt(),
      });
      specs.push({ type: 'individuelle', userIds: [user.id] });
    }

    const familyUsers = faker.helpers.arrayElements(users, Math.min(3, users.length));
    rows.push({
      type: 'famille',
      price: FAMILY_PRICE_CENTS,
      startsAt,
      endsAt,
      createdAt: createdAt(),
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
