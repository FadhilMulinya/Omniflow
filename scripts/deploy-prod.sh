#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "server/.env" ]]; then
  echo "Error: server/.env not found. Create it from server/.env.example first."
  exit 1
fi

if [[ ! -f "nginx/ssl/cert.pem" || ! -f "nginx/ssl/key.pem" ]]; then
  echo "Error: missing TLS files. Expected nginx/ssl/cert.pem and nginx/ssl/key.pem"
  exit 1
fi

echo "Building and deploying production stack..."
docker compose -f docker-compose.prod.yml up --build -d

echo "Deployment complete. Current status:"
docker compose -f docker-compose.prod.yml ps

echo "Use this to stream logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
