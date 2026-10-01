# BDL Player — manual kickoff checklist

Work that cannot be completed from this repo alone. Use preview first, then production.

## Progress

Last verified: 2026-10-01.

- [x] Local `bdl-player` app scaffold (Next.js, Drizzle, OAuth, `/api/me`, change feed).
- [x] **GitHub:** https://github.com/jsartin513/bdl-player — `main` and `preview` pushed (integration branch: **`preview`**, same as `bdl-admin`).
- [x] **`bdl-packages` contract PR:** [PR #6](https://github.com/jsartin513/bdl-packages/pull/6) (**merged** to `main`).
- [x] Pin contract in `package.json` via pnpm git dep (`4592757…&path:player-public-contract`) — post-merge `main` SHA.
- [ ] **GitHub Actions:** add repo secret `BDL_PACKAGES_READ_TOKEN` (read access to private `jsartin513/bdl-packages`; required for `bash scripts/with-bdl-git-auth.sh` on every CI install even though the contract pin points at public `main`).
- [ ] **Neon console:** player DB + admin sensitive DB (human).
- [ ] **Google Cloud:** Web OAuth client + redirect URIs (human).
- [ ] **Vercel:** `bdl-player` project — **not listed** on team (`bdl-admin` exists; no `bdl-player` yet). See [Vercel — create project (human)](#vercel--create-bdl-player-project-human) below.
- [ ] **DNS:** `play-preview` / `play` → player Vercel (human).
- [ ] **Stripe / Resend** (Stage 3+; human).
- [x] **Admin public catalog API** — [bdl-admin #166](https://github.com/jsartin513/bdl-admin/pull/166) merged; `GET /api/public/leagues` is unauthenticated. Player app reads it via `NEXT_PUBLIC_LEAGUE_CATALOG_URL` (`fetchLeagueCatalog`, `/leagues` stub).

### Remaining human steps (Stage 1)

1. Add GitHub repo secret **`BDL_PACKAGES_READ_TOKEN`** (CI install of `@bdl/player-public-contract`).
2. Create **Neon** player DB (+ admin sensitive DB on admin side); run player migrations; set **`PLAYER_DATABASE_URL`** on Vercel.
3. Create **Google OAuth** Web client + redirect URIs; set **`PLAYER_GOOGLE_CLIENT_*`** on Vercel.
4. Create **Vercel** `bdl-player` project, env vars, and **`PLAYER_SESSION_SECRET`** / **`PLAYER_SYNC_SECRET`** (match admin).
5. **DNS** for `play-preview` / `play` hostnames.

## Summary

- **Player app** (`bdl-player`): accounts, profile, registrations, payments — own Neon DB.
- **Admin** (`bdl-admin`): leagues, draft, staff skill — pulls player changes; publishes public league catalog.
- **Contract** (`@bdl/player-public-contract` in `bdl-packages`): shared types and forbidden-key tests.

## GitHub

- [x] Repo `jsartin513/bdl-player` on GitHub (public).
- [ ] Optional: set GitHub **default branch** to `preview` (today: `main`; workflow still deploys preview from `preview` branch).
- [x] Merge [bdl-packages PR #6](https://github.com/jsartin513/bdl-packages/pull/6); pin at `4592757b1d98b9daf3c8e5a5f0e1bad3279fdfdc` on `main`.

## Google OAuth (player app only)

- [ ] Create or reuse a **Web** OAuth client for the player app (separate from admin Google client).
- [ ] Authorized redirect URIs:
  - [ ] `http://localhost:3000/api/player/google/callback`
  - [ ] `https://play-preview.bostondodgeballleague.com/api/player/google/callback`
  - [ ] `https://play.bostondodgeballleague.com/api/player/google/callback`
- [ ] Set `PLAYER_GOOGLE_CLIENT_ID` and `PLAYER_GOOGLE_CLIENT_SECRET` in Vercel (**TODO: secrets**).

## Neon

- [ ] New Neon project for **player** data only.
- [ ] New Neon project for **admin sensitive** skill/notes (admin Stage 0 — separate from player).
- [ ] Run `drizzle` migration on player DB (`drizzle/0000_player_accounts.sql` or `db:migrate` when scripted).
- [ ] Set `PLAYER_DATABASE_URL` on player Vercel (**TODO: secret**).

## Vercel — create `bdl-player` project (human)

Do **not** create via automation until `jsartin513/bdl-player` exists on GitHub.

1. Vercel team: same team as `bdl-admin` (`team_enos0L05q9LlcLBuyq8DrquY`).
2. **Add New Project** → import `jsartin513/bdl-player`.
3. **Production Branch:** `main`. Enable preview deployments for **`preview`** (match admin preview-first flow).
4. Add domains: `play-preview.bostondodgeballleague.com` (Preview), `play.bostondodgeballleague.com` (Production).
5. Set non-secret env vars below (Preview + Production targets). Add secrets in dashboard only.

## Vercel — `bdl-player` project

Non-secret vars (safe to document; set in Vercel per environment):

| Variable | Preview value | Production value |
|----------|---------------|------------------|
| `NEXT_PUBLIC_APP_URL` | `https://play-preview.bostondodgeballleague.com` | `https://play.bostondodgeballleague.com` |
| `NEXT_PUBLIC_LEAGUE_CATALOG_URL` | `https://admin-preview.bostondodgeballleague.com/api/public/leagues` | `https://admin.bostondodgeballleague.com/api/public/leagues` |

Set both on the player Vercel project once it exists (preview admin catalog is live after #166).

Checklist:

- [ ] `NEXT_PUBLIC_APP_URL` (per table)
- [ ] `NEXT_PUBLIC_LEAGUE_CATALOG_URL` (per table)

Secrets (**TODO** — set in Vercel dashboard, not in git):

- [ ] `PLAYER_SESSION_SECRET`
- [ ] `PLAYER_GOOGLE_CLIENT_ID`
- [ ] `PLAYER_GOOGLE_CLIENT_SECRET`
- [ ] `PLAYER_DATABASE_URL`
- [ ] **`PLAYER_SYNC_SECRET`** — must **match `bdl-admin`** (same Preview / Production targets). Authorizes admin `GET /api/internal/v1/changes` via header **`X-BDL-Player-Sync-Secret`**. Generate once with `openssl rand -base64 32`; set **Sensitive** on both Vercel projects; redeploy. Smoke tests: [bdl-admin `player-sync-runbook.md`](https://github.com/jsartin513/bdl-admin/blob/preview/docs/player-sync-runbook.md).
- [ ] `SENTRY_DSN` (when Sentry project exists)

## Vercel — `bdl-admin` (follow-up PRs)

Non-secret:

- [ ] `PLAYER_APP_BASE_URL` — `https://play-preview...` / `https://play...`
- [ ] `NEXT_PUBLIC_LEAGUE_CATALOG` is not needed on admin; player reads admin public API.

Secrets (**TODO**):

- [ ] **`PLAYER_SYNC_SECRET`** — same value as player app (Preview first). **`PLAYER_SYNC_SECRET` is set on admin Preview** — copy from Vercel `bdl-admin` → set on `bdl-player` Preview when ready. See [player-sync-runbook.md](https://github.com/jsartin513/bdl-admin/blob/preview/docs/player-sync-runbook.md).
- [ ] `SENSITIVE_DATABASE_URL` (after sensitive DB split)

## DNS

- [ ] `play-preview.bostondodgeballleague.com` → player Vercel preview
- [ ] `play.bostondodgeballleague.com` → player Vercel production

## Preview test data (after seeds exist)

- [ ] Run admin `seed:preview` (leagues) then player `seed:preview` (accounts/registrations).
- [ ] Document Google test accounts in player repo README.
- [ ] Confirm preview admin sync URL points at preview player only.

## Stripe / email (Stage 3+)

- [ ] Stripe test mode keys on preview (**TODO: secrets**).
- [ ] Resend API key on player project (**TODO: secret**).
