import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/services/db/schema/*.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.PGHOST ?? 'localhost',
    port: Number(process.env.PGPORT ?? '5432'),
    user: process.env.PGUSER ?? 'postgres',
    password: process.env.PGPASSWORD ?? 'postgres',
    database: process.env.PGDATABASE ?? 'postgres',
    ssl: process.env.PGSSLMODE === 'disable' ? false : undefined,
  },
  strict: true,
  verbose: true,
});
