#!/bin/bash
# start.sh - Builds and starts Frame Hub in production with optional Cloudflare tunnel
# Usage: ./start.sh [--dev]
#   --dev   Skip build and run Next.js dev server instead
#
# Environment (all optional):
#   PORT                 Default 3000
#   PUBLIC_DOMAIN        Shown in banner; default https://frame-hub.com
#   CLOUDFLARED_CONFIG   Tunnel config file; default ~/.cloudflared/config-framehub.yml
#   SKIP_TUNNEL          Set to 1 to skip Cloudflare (local or no creds)
#   OVERFRAME_SYNC_DATA  Set to 1 to run scripts/convert_data_v2.py before build (needs Dart data path)

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PORT="${PORT:-3000}"
DOMAIN="${PUBLIC_DOMAIN:-https://frame-hub.com}"
TUNNEL_CONFIG="${CLOUDFLARED_CONFIG:-$HOME/.cloudflared/config-framehub.yml}"
DEV_MODE=false
TUNNEL_PID=""

if [ "$1" = "--dev" ]; then
  DEV_MODE=true
fi

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Optional: Dart → TypeScript data sync (host must have OVERFRAME_DART_DIR or sibling overframe-app) ---
if [ "${OVERFRAME_SYNC_DATA:-}" = "1" ] && [ -f "$DIR/scripts/convert_data_v2.py" ]; then
  echo "OVERFRAME_SYNC_DATA=1: running scripts/convert_data_v2.py ..."
  python3 "$DIR/scripts/convert_data_v2.py" || {
    echo "WARN: Data converter exited with an error; fix paths or set OVERFRAME_DART_DIR. Continuing."
  }
fi

# --- Kill anything already on our port ---
echo "Checking for existing processes on port $PORT..."
if command -v fuser >/dev/null 2>&1; then
  fuser -k "$PORT"/tcp 2>/dev/null && sleep 1 || true
else
  echo "(fuser not installed; skip port cleanup — ensure port $PORT is free)"
fi

# --- Clean stale build cache ---
if [ -d ".next" ]; then
  echo "Removing stale .next build cache..."
  rm -rf .next 2>/dev/null || sudo rm -rf .next
fi

# --- Start Cloudflare named tunnel (optional) ---
if [ "${SKIP_TUNNEL:-}" = "1" ]; then
  echo "SKIP_TUNNEL=1: not starting Cloudflare tunnel."
elif ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not in PATH; skipping tunnel. Set SKIP_TUNNEL=1 to silence this."
elif [ ! -f "$TUNNEL_CONFIG" ]; then
  echo "Tunnel config not found: $TUNNEL_CONFIG"
  echo "  Set CLOUDFLARED_CONFIG or SKIP_TUNNEL=1. Continuing without tunnel."
else
  echo "Starting Cloudflare tunnel (frame-hub)..."
  cloudflared tunnel --config "$TUNNEL_CONFIG" run frame-hub &
  TUNNEL_PID=$!
  sleep 2
  if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
    echo "ERROR: Tunnel failed to start."
    exit 1
  fi
  echo "Tunnel running (PID $TUNNEL_PID)"
fi

# --- Build & Start Next.js ---
echo ""
echo "================================================"
echo "  Local:  http://localhost:$PORT"
echo "  Public: $DOMAIN"
echo "================================================"
echo ""

if [ "$DEV_MODE" = true ]; then
  echo "Starting Next.js dev server..."
  npm run dev
else
  echo "Building for production..."
  npm run build
  echo "Starting Next.js production server..."
  npm run start
fi
