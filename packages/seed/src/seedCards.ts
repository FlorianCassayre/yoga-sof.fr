import { faker } from '@faker-js/faker';
import {
  cardSettingsTable,
  cardTemplatesTable,
  cardValidUntil,
  type CourseType,
} from '@yoga-sof/core';
import { cardsTable, type usersTable } from '@yoga-sof/core/server';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface SeedCardsParameters {
  users: (typeof usersTable.$inferSelect)[];
  admin: typeof usersTable.$inferSelect;
}

const TEMPLATES: { type: CourseType; price: number; count: number }[] = [
  { type: 'adulte', price: 20000, count: 10 },
  { type: 'adulte', price: 11000, count: 5 },
  { type: 'enfant', price: 15000, count: 10 },
  { type: 'enfant', price: 8500, count: 5 },
];

export async function seedCards(db: NodePgDatabase, { users, admin }: SeedCardsParameters) {
  await db.delete(cardsTable);
  await db.delete(cardTemplatesTable);
  await db.delete(cardSettingsTable);

  await db.insert(cardSettingsTable).values({ validityMonths: 12 });
  const templates = await db.insert(cardTemplatesTable).values(TEMPLATES).returning();

  const now = new Date();
  const rows: (typeof cardsTable.$inferInsert)[] = [];
  const holders = faker.helpers.arrayElements(users, Math.min(7, users.length));

  for (const user of holders) {
    const template = faker.helpers.arrayElement(templates);
    const createdAt = faker.date.recent({ days: 180, refDate: now });
    const canceled = faker.helpers.maybe(() => true, { probability: 0.25 });

    rows.push({
      userId: user.id,
      templateId: template.id,
      type: template.type,
      price: template.price,
      count: template.count,
      remaining: template.count,
      validUntil: cardValidUntil({ purchasedAt: createdAt, months: 12 }),
      createdAt,
      ...(canceled
        ? {
            canceled: true,
            canceledAt: faker.date.between({ from: createdAt, to: now }),
            canceledBy: admin.id,
          }
        : {}),
    });
  }

  const cards = await db.insert(cardsTable).values(rows).returning();

  console.log(`Seeded ${cards.length} cards!`);
}
