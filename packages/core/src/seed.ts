import { config } from 'dotenv';

config({ path: '../../.env' });

import { asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { coursesTable } from './features/course';

const db = drizzle({
  connection: process.env.DATABASE_URL!,
});

const COURSE_COUNT = 50;

const NOTES = [
  'Salle attenante réservée',
  'Prévoir tapis supplémentaires',
  '',
  'Cours confirmé avec la mairie',
  'Remplacer par Sophiens le jour même',
  '',
];

async function seedCourses() {
  await db.delete(coursesTable);

  const courses = Array.from(
    { length: COURSE_COUNT },
    (_, index): typeof coursesTable.$inferInsert => {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setUTCDate(day.getUTCDate() + index);
      const start = new Date(day);
      start.setUTCHours(9 + (index % 4) * 2);
      const end = new Date(start);
      end.setUTCHours(end.getUTCHours() + 2);

      return {
        type: index % 2 === 0 ? 'adulte' : 'enfant',
        startsAt: start,
        endsAt: end,
        capacity: 8 + (index % 4) * 4,
        registeredCount: index % 5 === 0 ? 0 : (index * 3) % 10,
        visibility: index % 2 === 0 ? 'public' : 'private',
        internalNotes: NOTES[index % NOTES.length] ?? '',
      };
    },
  );

  await db.insert(coursesTable).values(courses);
  const count = await db.select().from(coursesTable).orderBy(asc(coursesTable.startsAt));
  console.log(`Seeded ${count.length} courses!`);
}

async function main() {
  await seedCourses();
}

void main();
