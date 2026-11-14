import type { Client } from 'pg';

export async function truncateDatabase(client: Client) {
  const { rows } = await client.query<{ tables: string | null }>(
    `SELECT string_agg(format('%I', table_name), ', ') AS tables
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `,
  );
  const tables = rows[0]?.tables;
  if (!tables) {
    console.log('Database is already empty, skipping the truncation.');
    return;
  }
  await client.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  console.log('Truncated the database.');
}
