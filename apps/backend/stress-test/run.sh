#!/usr/bin/env bash
# Runs the stress test stage by stage and builds the reports.
#   ./stress-test/run.sh                     # 5 10 25 50 75 100 users
#   STAGES="5 10" ./stress-test/run.sh       # custom stages
#   STAGE_DURATION=30s COOLDOWN=10 ./stress-test/run.sh
# requires: export LOADTEST_USERS="user1:pass1,user2:pass2"
set -u
: "${LOADTEST_USERS:?set LOADTEST_USERS=user:pass,user:pass}"
cd "$(dirname "$0")/.."

STAGES=${STAGES:-"5 10 25 50 75 100"}
export STAGE_DURATION=${STAGE_DURATION:-60s}
COOLDOWN=${COOLDOWN:-30}
export BASE_URL=${BASE_URL:-https://api.openfile.exvillager.xyz}
export RUN_ID=${RUN_ID:-$(date +%m%d-%H%M%S)}
OUT=stress-test/results/$RUN_ID
mkdir -p "$OUT"
echo "run $RUN_ID -> $BASE_URL, stages: $STAGES"

for vus in $STAGES; do
  export VUS=$vus OUT_DIR="$OUT/stage-$(printf %03d "$vus")"
  mkdir -p "$OUT_DIR"
  echo "=== $vus users ($STAGE_DURATION) ==="
  k6 run --quiet stress-test/k6-stress.js 2>&1 | tail -n 5
  sleep "$COOLDOWN"
done

bun stress-test/report.ts "$OUT" > /dev/null
echo "report: $OUT/REPORT.md"
echo "cleanup: bun stress-test/cleanup.ts $RUN_ID"
