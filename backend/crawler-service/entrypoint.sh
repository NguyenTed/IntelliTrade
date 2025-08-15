#!/bin/sh
set -e

STATE_DIR="/var/lib/crawler"
mkdir -p "$STATE_DIR"
INIT_FLAG="$STATE_DIR/.initialized"

if [ ! -f "$INIT_FLAG" ]; then
  echo "🚀 Running initial crawler (runner.py)..."
  python scripts/runner.py
  touch "$INIT_FLAG"
  echo "✅ Crawler init done!"
else
  echo "🕒 Skipping crawler (already initialized)"
fi

echo "🚀 Starting Flask API (main.py)..."
exec python app/main.py
