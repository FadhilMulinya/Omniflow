#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "server/.env" ]]; then
  echo "server/.env not found. Creating it from server/.env.example"
  cp server/.env.example server/.env
  echo "Fill server/.env and re-run this script."
  exit 1
fi

echo "Starting local development stack (mongo + server + client)..."
docker compose up --build
