import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { defineConfig } from 'drizzle-kit';

// This file is used for drizzle cli commands

const envConfig = dotenv.config({ path: '.env.local' });
dotenvExpand.expand(envConfig);

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
