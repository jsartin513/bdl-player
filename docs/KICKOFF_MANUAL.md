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
- [x] **Vercel:** `bdl-player` on team `team_enos0L05q9LlcLBuyq8DrquY` — **created via Vercel MCP** (linked `jsartin513/bdl-player`, production branch **`main`**, preview deploys from all non-production branches including **`preview`**). Project id **`prj_8yqTc0z6QUfcGUhKArdKSSdXLwtd`** · dashboard https://vercel.com/jessica-sartins-projects/bdl-player · default URL https://bdl-player.vercel.app
- [x] **Vercel domains (project):** `play-preview.bostondodgeballleague.com` → git branch **`preview`**; `play.bostondodgeballleague.com` → **Production** (both show verified in Vercel as of kickoff).
- [x] **Vercel env (non-secret):** Preview — `NEXT_PUBLIC_APP_URL=https://play-preview.bostondodgeballleague.com`, `NEXT_PUBLIC_LEAGUE_CATALOG_URL=https://admin-preview.bostondodgeballleague.com/api/public/leagues`. Production — `https://play.bostondodgeballleague.com` and `https://admin.bostondodgeballleague.com/api/public/leagues`.
- [ ] **DNS (registrar):** confirm `play-preview` and `play` CNAMEs if the apex is not fully on Vercel DNS (see [DNS](#dns)).
- [ ] **Stripe / Resend** (Stage 3+; human).
- [x] **Admin public catalog API** — [bdl-admin #166](https://github.com/jsartin513/bdl-admin/pull/166) merged; `GET /api/public/leagues` is unauthenticated. Player app reads it via `NEXT_PUBLIC_LEAGUE_CATALOG_URL` (`fetchLeagueCatalog`, `/leagues` stub).

### Remaining human steps (Stage 1)

1. Add GitHub repo secret **`BDL_PACKAGES_READ_TOKEN`** (CI install of `@bdl/player-public-contract`).
2. Create **Neon** player DB (+ admin sensitive DB on admin side); run player migrations; set **`PLAYER_DATABASE_URL`** on Vercel.
3. Create **Google OAuth** Web client + redirect URIs; set **`PLAYER_GOOGLE_CLIENT_*`** on Vercel.
4. Set Vercel **TODO(secret)** env vars (`PLAYER_SESSION_SECRET`, **`PLAYER_SYNC_SECRET`** match admin, OAuth, DB).
5. **DNS** registrar CNAMEs for `play-preview` / `play` (confirm in Vercel Domains).

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

**Status (2026-10-01):** Project already created (MCP). Use this section only if you need to recreate or audit settings.

1. Vercel team: same team as `bdl-admin` (`team_enos0L05q9LlcLBuyq8DrquY`).
2. **Add New Project** → import `jsartin513/bdl-player` (or **Import** if the project was deleted).
3. **Production Branch:** `main`. Push to **`preview`** should produce Preview deployments (match admin preview-first flow).
4. Domains: `play-preview.bostondodgeballleague.com` (assign to git branch **`preview`**), `play.bostondodgeballleague.com` (Production).
5. Set non-secret env vars below (Preview + Production targets). Add secrets in dashboard only.

**If import fails in automation** (GitHub app not installed, wrong team, etc.):

1. Open https://vercel.com/new — pick team `team_enos0L05q9LlcLBuyq8DrquY`.
2. **Import** `jsartin513/bdl-player` → project name **`bdl-player`**.
3. Framework **Next.js**; install command should pick up **pnpm** from `packageManager` in `package.json`.
4. **Settings → Git → Production Branch:** `main`.
5. **Settings → Domains:** add the two hostnames above; branch alias for preview hostname → `preview`.
6. **Settings → Environment Variables:** copy the [non-secret table](#vercel--bdl-player-project) below; add **TODO(secret)** keys with real values only (never placeholders).

## Vercel — `bdl-player` project

Non-secret vars (safe to document; set in Vercel per environment):

| Variable | Preview value | Production value |
|----------|---------------|------------------|
| `NEXT_PUBLIC_APP_URL` | `https://play-preview.bostondodgeballleague.com` | `https://play.bostondodgeballleague.com` |
| `NEXT_PUBLIC_LEAGUE_CATALOG_URL` | `https://admin-preview.bostondodgeballleague.com/api/public/leagues` | `https://admin.bostondodgeballleague.com/api/public/leagues` |

Set both on the player Vercel project once it exists (preview admin catalog is live after #166).

Checklist:

- [x] `NEXT_PUBLIC_APP_URL` (per table) — set on Vercel 2026-10-01
- [x] `NEXT_PUBLIC_LEAGUE_CATALOG_URL` (per table) — set on Vercel 2026-10-01

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

At the **domain registrar** (or DNS host for `bostondodgeballleague.com`), add **CNAME** records unless the whole zone is delegated to Vercel (same pattern as `admin-preview` / `admin`):

| Host / name | Type | Value (target) | Serves |
|-------------|------|----------------|--------|
| `play-preview` | CNAME | `cname.vercel-dns.com` | Preview deployments from branch **`preview`** (via Vercel domain → branch mapping) |
| `play` | CNAME | `cname.vercel-dns.com` | Production (`main`) |

After saving DNS, confirm in Vercel **Project → Settings → Domains** that both hostnames show **Valid**. Vercel may show a project-specific target instead of the generic CNAME; use whatever the domain card lists if it differs.

- [ ] Registrar CNAMEs for `play-preview` / `play` (human) — **verify** even if Vercel already shows verified
- [x] Vercel project has both domains attached to **`bdl-player`**

## Preview test data (after seeds exist)

- [ ] Run admin `seed:preview` (leagues) then player `seed:preview` (accounts/registrations).
- [ ] Document Google test accounts in player repo README.
- [ ] Confirm preview admin sync URL points at preview player only.

## Stripe / email (Stage 3+)

- [ ] Stripe test mode keys on preview (**TODO: secrets**).
- [ ] Resend API key on player project (**TODO: secret**).
