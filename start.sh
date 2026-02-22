#!/bin/bash
# start.sh - Builds and starts Frame Hub in production with Cloudflare tunnel
# Usage: ./start.sh [--dev]
#   --dev   Skip build and run Next.js dev server instead

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PORT=3000
DOMAIN="https://frame-hub.com"
TUNNEL_CONFIG="/home/jason/.cloudflared/config-framehub.yml"
DEV_MODE=false

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

# --- Kill anything already on our port ---
echo "Checking for existing processes on port $PORT..."
fuser -k $PORT/tcp 2>/dev/null && sleep 1 || true

# --- Clean stale build cache ---
if [ -d ".next" ]; then
  echo "Removing stale .next build cache..."
  rm -rf .next 2>/dev/null || sudo rm -rf .next
fi

# --- Start Cloudflare named tunnel ---
echo "Starting Cloudflare tunnel (frame-hub)..."
cloudflared tunnel --config "$TUNNEL_CONFIG" run frame-hub &
TUNNEL_PID=$!
sleep 2

if ! kill -0 $TUNNEL_PID 2>/dev/null; then
  echo "ERROR: Tunnel failed to start."
  exit 1
fi

echo "Tunnel running (PID $TUNNEL_PID)"

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
