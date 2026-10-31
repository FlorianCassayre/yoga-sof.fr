import { TZDate } from '@date-fns/tz';
import { faker } from '@faker-js/faker';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { coursesTable } from '../features/course';
import { APP_TIMEZONE } from '../util/date';

const WEEKS_PAST = 5;
const WEEKS_FUTURE = 3;

// The weekly planning is decided once (Monday to Friday, Paris wall-clock
// times, fixed durations, slots more than 90 minutes apart so sessions never
// overlap) and repeated across weeks.
const WEEKLY_PLANNING = [
  { weekday: 1, hour: 9, minute: 30, duration: 90, type: 'adulte' },
  { weekday: 2, hour: 17, minute: 15, duration: 60, type: 'enfant' },
  { weekday: 3, hour: 14, minute: 0, duration: 75, type: 'adulte' },
  { weekday: 3, hour: 16, minute: 30, duration: 60, type: 'enfant' },
  { weekday: 4, hour: 9, minute: 45, duration: 75, type: 'adulte' },
  { weekday: 5, hour: 17, minute: 0, duration: 60, type: 'enfant' },
] as const;

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

  const monday = mondayOfWeek(new Date());
  const weeks = Array.from({ length: WEEKS_PAST + WEEKS_FUTURE }, (_, index) => index - WEEKS_PAST);

  const courses = weeks.flatMap((week) =>
    WEEKLY_PLANNING.map((slot): typeof coursesTable.$inferInsert => {
      const startsAt = new TZDate(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + week * 7 + slot.weekday - 1,
        slot.hour,
        slot.minute,
        APP_TIMEZONE,
      );

      return {
        type: slot.type,
        startsAt,
        endsAt: new Date(startsAt.getTime() + slot.duration * 60 * 1000),
        capacity: faker.number.int({ min: 8, max: 20 }),
        registeredCount: 0,
        visibility: faker.helpers.arrayElement(['public', 'private'] as const),
        internalNotes:
          faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? '',
      };
    }),
  );

  const inserted = await db.insert(coursesTable).values(courses).returning();
  console.log(`Seeded ${inserted.length} courses!`);

  return inserted;
}
