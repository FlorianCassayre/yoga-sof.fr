import { pgEnum } from 'drizzle-orm/pg-core';

export const courseTypeEnum = pgEnum('course_type', ['adulte', 'enfant']);
