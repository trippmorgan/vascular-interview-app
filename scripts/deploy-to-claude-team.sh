#!/usr/bin/env bash
# Deploy the vascular-interview-app to claude-team's static-served public dir.
#
# Usage: scripts/deploy-to-claude-team.sh [target]
#   target = local  (default) -- copy dist-claude-team/ to ../claude-team/public/vascular/
#          = office          -- rsync dist-claude-team/ to server1:/root/claude-team/public/vascular/
#
# Two variants of the SPA exist because the original is served at /vascular-interview-app/
# (Vite dev server) and the claude-team-hosted variant must use base=/vascular/.
# build:claude-team produces a separate dist-claude-team/ dir so the original build
# (dist/) is untouched.
set -euo pipefail

TARGET="${1:-local}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="$HERE/dist-claude-team"

cd "$HERE"

echo "[deploy] building SPA with VITE_BASE=/vascular/ ..."
npm run build:claude-team

if [[ ! -d "$SRC_DIR" ]]; then
  echo "[deploy] ERROR: build did not produce $SRC_DIR" >&2
  exit 1
fi

case "$TARGET" in
  local)
    DEST="$HERE/../claude-team/public/vascular"
    echo "[deploy] syncing $SRC_DIR -> $DEST"
    mkdir -p "$DEST"
    rsync -a --delete "$SRC_DIR/" "$DEST/"
    echo "[deploy] done. Local claude-team static path populated."
    ;;
  office)
    DEST="server1:/root/claude-team/public/vascular/"
    echo "[deploy] rsyncing $SRC_DIR -> $DEST"
    ssh server1 'mkdir -p /root/claude-team/public/vascular'
    rsync -a --delete -e 'ssh -o ConnectTimeout=10' "$SRC_DIR/" "$DEST"
    echo "[deploy] done. Office claude-team static path populated."
    echo "[deploy] verify: curl -sS http://100.75.237.36:3000/vascular/ | head -5"
    ;;
  *)
    echo "[deploy] unknown target: $TARGET (expected 'local' or 'office')" >&2
    exit 2
    ;;
esac
