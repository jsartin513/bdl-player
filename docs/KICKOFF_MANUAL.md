# BDL Player — manual kickoff checklist

Work that cannot be completed from this repo alone. Use preview first, then production.

## Summary

- **Player app** (`bdl-player`): accounts, profile, registrations, payments — own Neon DB.
- **Admin** (`bdl-admin`): leagues, draft, staff skill — pulls player changes; publishes public league catalog.
- **Contract** (`@bdl/player-public-contract` in `bdl-packages`): shared types and forbidden-key tests.

## GitHub

- [ ] Create private repo `jsartin513/bdl-player` (if not already pushed from local).
- [ ] Default branch: `preview`; production merges `preview` → `main`.
- [ ] Merge `bdl-packages` PR that adds `player-public-contract`; pin full SHA in `bdl-player/package.json` (replace `file:../bdl-packages/...`).

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

## Vercel — `bdl-player` project

Non-secret vars (set now):

- [ ] `NEXT_PUBLIC_APP_URL` — `https://play-preview.bostondodgeballleague.com` (Preview) / `https://play.bostondodgeballleague.com` (Production)
- [ ] `NEXT_PUBLIC_LEAGUE_CATALOG_URL` — admin public leagues URL for that environment

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
