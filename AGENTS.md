# BDL Player — agent guide

Player-facing app for league registration, profile, and history. Pairs with [bdl-admin](https://github.com/jsartin513/bdl-admin). Human setup (Vercel, Neon, OAuth) stays in [docs/KICKOFF_MANUAL.md](docs/KICKOFF_MANUAL.md).

## Branches

- Feature and fix PRs go into `preview`.
- Release PRs go from `preview` to `main`.
- Open every PR as a draft. Mark it ready only when the work is done.

## Commands

Node 20+ (`package.json` `engines`). Package manager is pnpm 10.14.0.

- Install: `pnpm install --frozen-lockfile`. CI uses `bash scripts/with-bdl-git-auth.sh` (same install, plus git auth for private packages).
- Lint: `npm run lint`
- Typecheck: `pnpm exec tsc --noEmit`
- Test: `npm run test:run`

Private `@bdl/*` packages may not install on agent VMs. Do not block on that. Vercel's preview build is the real check (`next build`, including `db:migrate:deploy` when `PLAYER_DATABASE_URL` is set). GitHub Actions does not run that build.

## Reviews and scope

- Do not request Copilot or Bugbot reviews on drafts, docs-only PRs, or release PRs (`preview` → `main`).
- Keep changes scoped. Avoid broad exploration. Do not use fast mode.
