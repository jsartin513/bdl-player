#!/usr/bin/env bash
# pnpm install with git auth for private jsartin513/bdl-packages subdirectory deps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -n "${BDL_PACKAGES_READ_TOKEN:-}" ]]; then
  git config --global url."https://x-access-token:${BDL_PACKAGES_READ_TOKEN}@github.com/".insteadOf "https://github.com/"
fi

corepack enable pnpm 2>/dev/null || true
if [[ -f pnpm-lock.yaml ]]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi
