# BDL Player

Player-facing app for league registration, profile, and history. Pairs with [bdl-admin](https://github.com/jsartin513/bdl-admin).

## Docs

- [Kickoff manual (GitHub, Vercel, Neon, OAuth)](docs/KICKOFF_MANUAL.md)

## Local dev

```bash
cp .env.example .env.local
# Fill TODO secrets in .env.local (never commit).
npm install
npm run test:run
npm run dev
```

Requires Node 20+. Uses `player_session` Google login (same pattern as [open-gym-payment-collector#54](https://github.com/jsartin513/open-gym-payment-collector/pull/54)), without an email allowlist.

## Scripts

- `npm run dev` — Next.js (Turbopack)
- `npm run test:run` — Vitest (env boundary + public profile)
- `npm run build` — runs `db:migrate:deploy` when `PLAYER_DATABASE_URL` is set, then Next.js production build
- `npm run db:migrate` — apply Drizzle migrations (requires `PLAYER_DATABASE_URL`)

Neon setup: [docs/NEON_SETUP.md](docs/NEON_SETUP.md).

## Branches

- `preview` — integration / preview deploy
- `main` — production
