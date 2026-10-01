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

Use a **dedicated** Google Cloud **Web application** OAuth client for `bdl-player`. Do **not** reuse the admin client (`ADMIN_GOOGLE_CLIENT_ID` / `ADMIN_GOOGLE_CLIENT_SECRET` on `bdl-admin`). Admin callbacks live under `/api/admin/google/*` on `admin*` hosts; player callbacks live under `/api/player/google/*` on `play*` hosts. Mixing clients or redirect URIs produces `redirect_uri_mismatch` from Google.

Player sign-in flow (implemented in this repo):

1. `/login` → user clicks **Sign in with Google** → `GET /api/player/google/login`
2. Google consent → `GET /api/player/google/callback` (exchanges code, verifies `id_token`, sets `player_session` cookie)
3. Redirect back to `returnTo` (default `/`)

The app builds `redirect_uri` as `{NEXT_PUBLIC_APP_URL}/api/player/google/callback` (see `app/api/player/google/login/route.ts` and `callback/route.ts`). **`NEXT_PUBLIC_APP_URL` must match the host the user actually visits** (no trailing slash), same rule as admin auth.

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**.
2. Name it something like `BDL Player (play)` so it is obvious it is not admin.
3. **Authorized JavaScript origins** (if the console asks):
   - `http://localhost:3000`
   - `https://play-preview.bostondodgeballleague.com`
   - `https://play.bostondodgeballleague.com`
4. **Authorized redirect URIs** — register **exactly** these three (path must match the routes above):

   | Environment | Redirect URI |
   |-------------|--------------|
   | Local | `http://localhost:3000/api/player/google/callback` |
   | Preview | `https://play-preview.bostondodgeballleague.com/api/player/google/callback` |
   | Production | `https://play.bostondodgeballleague.com/api/player/google/callback` |

5. **OAuth scopes** requested at login: `openid`, `email`, `profile` (space-separated in the auth URL). No admin allowlist — any verified Google account can create a player account (unlike admin `ADMIN_ALLOWED_EMAILS`).

Admin OAuth setup for contrast: [bdl-admin players-and-auth runbook](https://github.com/jsartin513/bdl-admin/blob/main/.cursor/players-and-auth-runbook.md#google-cloud-oauth).

### Vercel env (player project only)

Set these as **encrypted** env vars on the `bdl-player` Vercel project (never commit values). Use the **Preview** environment for preview deployments / `play-preview` and **Production** for `play`. Local dev uses `.env.local` (see `.env.example`).

| Secret name | Notes |
|-------------|--------|
| `PLAYER_GOOGLE_CLIENT_ID` | Web client ID from step above (same client ID can be used for all three redirect URIs on one OAuth client). |
| `PLAYER_GOOGLE_CLIENT_SECRET` | Matching client secret. |
| `PLAYER_SESSION_SECRET` | Required for signed session cookies after Google sign-in (32+ random bytes). |
| `PLAYER_DATABASE_URL` | Neon player DB; account rows created on first Google login when DB is configured. |

Checklist:

- [ ] New **Web** OAuth client (not admin’s client).
- [ ] All three redirect URIs registered in Google Cloud.
- [ ] `PLAYER_GOOGLE_CLIENT_ID` + `PLAYER_GOOGLE_CLIENT_SECRET` on Vercel Preview and Production (and `.env.local` for local).
- [ ] `NEXT_PUBLIC_APP_URL` per [Vercel table](#vercel--bdl-player-project) so redirect URI matches the deployed host.

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
