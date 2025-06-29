import type { Config } from 'drizzle-kit';

export default {
  schema: './src/modules/*/*.schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hr_recruitment',
  },
  verbose: true,
  strict: true,
} satisfies Config;