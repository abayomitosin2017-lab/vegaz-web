#!/bin/bash
# Double-click to preview the Vegaz web app locally.
# First run installs dependencies (takes a minute). Close this window to stop.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Opening the download page..."
  echo "Install the LTS version, then double-click 'Start Preview' again."
  open "https://nodejs.org/en/download"
  read -r -p "Press Enter to close."
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js $(node -v) is too old. Nuxt needs version 20 or newer."
  open "https://nodejs.org/en/download"
  read -r -p "Press Enter to close."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only)..."
  npm install || { read -r -p "Install failed. Press Enter to close."; exit 1; }
fi

echo "Starting preview. Your browser will open automatically."
echo "Keep this window open while you preview. Close it to stop."
npm run dev -- --open
