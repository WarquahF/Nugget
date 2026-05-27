#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"
echo "Starting Nugget for Mac..."

if command -v node >/dev/null 2>&1; then
  node server.js
else
  echo "Node.js is required. Install Node.js 18 or newer, then run this file again."
  exit 1
fi
