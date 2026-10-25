import { pgEnum } from 'drizzle-orm/pg-core';

export const courseVisibilityEnum = pgEnum('course_visibility', ['public', 'private']);
