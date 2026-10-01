# BDL Player — manual kickoff checklist

Work that cannot be completed from this repo alone. Use preview first, then production.

## Progress

Last verified: 2026-09-30 (agent kickoff pass).

- [x] Local `bdl-player` app scaffold (Next.js, Drizzle, `file:../bdl-packages/player-public-contract` dep).
- [ ] **GitHub:** create private `jsartin513/bdl-player`, push local tree, set default branch **`preview`** — repo **does not exist** on GitHub yet (only local `main`, no remote).
- [x] **`bdl-packages` contract PR:** [PR #6 — Add @bdl/player-public-contract workspace](https://github.com/jsartin513/bdl-packages/pull/6) (**OPEN**, branch `cursor/player-public-contract`, no CI checks reported).
- [ ] Merge `bdl-packages` PR #6 and pin full git SHA in `bdl-player/package.json` (replace `file:../bdl-packages/...`).
- [ ] **Neon console:** player DB + admin sensitive DB (human).
- [ ] **Google Cloud:** Web OAuth client + redirect URIs (human).
- [ ] **Vercel:** `bdl-player` project — **not listed** on team (`bdl-admin` exists; no `bdl-player` yet). See [Vercel — create project (human)](#vercel--create-bdl-player-project-human) below.
- [ ] **DNS:** `play-preview` / `play` → player Vercel (human).
- [ ] **Stripe / Resend** (Stage 3+; human).
- [ ] **Admin public catalog API** live on preview — `GET https://admin-preview.bostondodgeballleague.com/api/public/leagues` currently **401** until [admin kickoff PRs](https://github.com/jsartin513/bdl-admin/blob/preview/docs/player-app-kickoff.md) ship; set `NEXT_PUBLIC_LEAGUE_CATALOG_URL` after that.

## Summary

- **Player app** (`bdl-player`): accounts, profile, registrations, payments — own Neon DB.
- **Admin** (`bdl-admin`): leagues, draft, staff skill — pulls player changes; publishes public league catalog.
- **Contract** (`@bdl/player-public-contract` in `bdl-packages`): shared types and forbidden-key tests.

## GitHub

- [ ] Create private repo `jsartin513/bdl-player` (if not already pushed from local). **Status:** not on GitHub as of 2026-09-30.
- [ ] Default branch: `preview`; production merges `preview` → `main`.
- [ ] Merge [bdl-packages PR #6](https://github.com/jsartin513/bdl-packages/pull/6) (`player-public-contract`); pin full SHA in `bdl-player/package.json` (replace `file:../bdl-packages/...`).

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

Use the catalog URLs **after** admin exposes `GET /api/public/leagues` without admin session auth. Until then, the player app can set the var but fetches will fail (preview currently returns 401).

Checklist:

- [ ] `NEXT_PUBLIC_APP_URL` (per table)
- [ ] `NEXT_PUBLIC_LEAGUE_CATALOG_URL` (per table; valid once admin API is live)

Secrets (**TODO** — set in Vercel dashboard, not in git):

- [ ] `PLAYER_SESSION_SECRET`
- [ ] `PLAYER_GOOGLE_CLIENT_ID`
- [ ] `PLAYER_GOOGLE_CLIENT_SECRET`
- [ ] `PLAYER_DATABASE_URL`
- [ ] `PLAYER_SYNC_SECRET` (must match admin)
- [ ] `SENTRY_DSN` (when Sentry project exists)

## Vercel — `bdl-admin` (follow-up PRs)

Non-secret:

- [ ] `PLAYER_APP_BASE_URL` — `https://play-preview...` / `https://play...`
- [ ] `NEXT_PUBLIC_LEAGUE_CATALOG` is not needed on admin; player reads admin public API.

Secrets (**TODO**):

- [ ] `PLAYER_SYNC_SECRET` (same value as player app)
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
