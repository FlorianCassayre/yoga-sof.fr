import { pgEnum } from 'drizzle-orm/pg-core';

export const roleTypeEnum = pgEnum('role_type', ['associate', 'manager', 'administrator']);
