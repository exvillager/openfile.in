#!/usr/bin/env bash
# Generate a migration from db/schema/schema.sql and regenerate sqlc code.
#
# Usage: ./scripts/db-gen.sh <migration_name>
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <migration_name>" >&2
  exit 1
fi

for bin in atlas sqlc docker; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "error: $bin is not installed" >&2
    exit 1
  fi
done

if ! docker info >/dev/null 2>&1; then
  echo "error: docker is not running (atlas needs it for the dev database)" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

echo "==> atlas migrate diff $1"
atlas migrate diff "$1" --env local

echo "==> sqlc generate"
sqlc generate

echo "==> done. review db/migrations and commit."
