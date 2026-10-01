import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PLAYER_DATABASE_URL ?? 'postgresql://localhost:5432/bdl_player',
  },
})
