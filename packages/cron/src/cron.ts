import { config } from 'dotenv';

config({ path: '../../.env' });

import { drizzle } from 'drizzle-orm/node-postgres';

import { createMailer } from './features/email/mailer';
import { createJobs } from './jobs';
import { runCron } from './runner';

const db = drizzle({ connection: process.env.DATABASE_URL! });
const mailer = createMailer();

runCron(createJobs(db, mailer));
