import { TZDate } from '@date-fns/tz';
import { faker } from '@faker-js/faker';
import { APP_TIMEZONE, courseBundlesTable, coursesTable, registerablesTable } from '@yoga-sof/core';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

const WEEKS_PAST = 5;
const WEEKS_FUTURE = 3;
const LOT_WEEKS_PAST = 6;
const LOT_WEEKS_FUTURE = 4;

// The weekly planning is decided once (Monday to Friday, Paris wall-clock
// times, fixed durations, slots more than 90 minutes apart so sessions never
// overlap) and repeated across weeks. Adulte slots are individual courses;
// enfant slots are grouped into lots, one per slot, each spanning ten
// consecutive weeks.
const WEEKLY_PLANNING = [
  { weekday: 1, hour: 9, minute: 30, duration: 90, type: 'adulte' },
  { weekday: 2, hour: 17, minute: 15, duration: 60, type: 'enfant' },
  { weekday: 3, hour: 14, minute: 0, duration: 75, type: 'adulte' },
  { weekday: 4, hour: 9, minute: 45, duration: 75, type: 'adulte' },
  { weekday: 5, hour: 17, minute: 0, duration: 60, type: 'enfant' },
] as const;

const WEEKDAY_LABELS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

const mondayOfWeek = (date: Date) => {
  const paris = new TZDate(date, APP_TIMEZONE);
  const daysSinceMonday = (paris.getDay() + 6) % 7;

  return new TZDate(
    paris.getFullYear(),
    paris.getMonth(),
    paris.getDate() - daysSinceMonday,
    APP_TIMEZONE,
  );
};

export async function seedCourses(db: NodePgDatabase) {
  await db.delete(coursesTable);
  await db.delete(courseBundlesTable);

  const monday = mondayOfWeek(new Date());
  const adulteWeeks = Array.from(
    { length: WEEKS_PAST + WEEKS_FUTURE },
    (_, index) => index - WEEKS_PAST,
  );
  const lotWeeks = Array.from(
    { length: LOT_WEEKS_PAST + LOT_WEEKS_FUTURE },
    (_, index) => index - LOT_WEEKS_PAST,
  );

  const enfantSlots = WEEKLY_PLANNING.filter((slot) => slot.type === 'enfant');
  const bundles = await db
    .insert(courseBundlesTable)
    .values(
      enfantSlots.map((slot) => ({
        label: `Lot de séances enfant du ${WEEKDAY_LABELS[slot.weekday - 1]}`,
        type: 'enfant' as const,
        price: faker.number.int({ min: 15000, max: 25000 }),
      })),
    )
    .returning();

  await db
    .insert(registerablesTable)
    .values(bundles.map((bundle) => ({ courseBundleId: bundle.id, capacity: 10 })));

  const course = (
    slot: (typeof WEEKLY_PLANNING)[number],
    week: number,
  ): typeof coursesTable.$inferInsert => {
    const startsAt = new TZDate(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + week * 7 + slot.weekday - 1,
      slot.hour,
      slot.minute,
      APP_TIMEZONE,
    );

    return slot.type === 'adulte'
      ? {
          type: slot.type,
          startsAt,
          endsAt: new Date(startsAt.getTime() + slot.duration * 60 * 1000),
          price: faker.number.int({ min: 1500, max: 3000 }),
          visibility: faker.helpers.arrayElement(['public', 'private'] as const),
          internalNotes:
            faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? '',
        }
      : {
          courseBundleId:
            bundles[enfantSlots.findIndex((enfantSlot) => enfantSlot.weekday === slot.weekday)]
              ?.id ?? null,
          startsAt,
          endsAt: new Date(startsAt.getTime() + slot.duration * 60 * 1000),
          visibility: faker.helpers.arrayElement(['public', 'private'] as const),
          internalNotes:
            faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? '',
        };
  };

  const inserted = await db
    .insert(coursesTable)
    .values([
      ...WEEKLY_PLANNING.filter((slot) => slot.type === 'adulte').flatMap((slot) =>
        adulteWeeks.map((week) => course(slot, week)),
      ),
      ...enfantSlots.flatMap((slot) => lotWeeks.map((week) => course(slot, week))),
    ])
    .returning();
  await db.insert(registerablesTable).values(
    inserted
      .filter((row) => row.courseBundleId === null)
      .map((row) => ({
        courseId: row.id,
        capacity: faker.number.int({ min: 8, max: 20 }),
      })),
  );

  console.log(`Seeded ${inserted.length} courses and ${bundles.length} lots de séances!`);

  return { courses: inserted, bundles };
}
