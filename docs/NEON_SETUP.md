# Neon setup — BDL Player

One-page guide for the **player app** database. Admin league data stays on admin `DATABASE_URL`; this project uses **`PLAYER_DATABASE_URL` only**.

## Create the database

1. [Neon Console](https://console.neon.tech) → **New Project** (e.g. `bdl-player`).
2. Copy the **pooled** connection string from **Connection details**.
3. Set it as `PLAYER_DATABASE_URL`:
   - **Local:** `.env.local` (from `.env.example`; never commit).
   - **Vercel:** player project → Settings → Environment Variables → Preview / Production.

Use a dedicated Neon project per environment if you want strict isolation (optional); many teams use one Neon project with separate databases or branches for preview vs production.

## Run migrations

Schema is versioned under `drizzle/` (initial migration: `0000_player_accounts.sql`). Drizzle Kit tracks applied migrations in `__drizzle_migrations`.

```bash
# From repo root; URL must be in the shell env, not committed
export PLAYER_DATABASE_URL='postgresql://USER:PASSWORD@HOST/DB?sslmode=require'
pnpm run db:migrate
```

Other scripts:

| Script | Purpose |
|--------|---------|
| `pnpm run db:migrate` | Apply pending SQL migrations (local, CI with URL, or manual ops) |
| `pnpm run db:migrate:deploy` | Same as migrate when `PLAYER_DATABASE_URL` is set; **no-op** when unset (used in `npm run build` on Vercel) |
| `pnpm run db:generate` | Regenerate migration from `app/db/schema.ts` after schema edits |
| `pnpm run db:push` | Push schema without migration files (dev only; prefer migrate for deploys) |
| `pnpm run db:studio` | Drizzle Studio against `PLAYER_DATABASE_URL` |

`drizzle.config.ts` reads `PLAYER_DATABASE_URL`; if unset locally, Drizzle Kit falls back to a placeholder localhost URL (migrations against real Neon always need the env var).

## Verify

Neon **SQL Editor**:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1;
```

After migrate you should see at least `player_accounts`, `player_profiles`, and `__drizzle_migrations`.

## Security

- Do not commit connection strings, `.env.local`, or production URLs.
- Do not point the player app at admin `DATABASE_URL` or sensitive DB URLs.
- Rotate credentials in Neon if a URL is ever exposed.

## Related

- [KICKOFF_MANUAL.md](KICKOFF_MANUAL.md) — full Stage 1 checklist (OAuth, Vercel, DNS).
