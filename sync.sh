#!/bin/sh
# Copies the repository files the documentation shows verbatim into shared/,
# so this folder builds on its own (its own repository, a Vercel upload, a zip).
# Inside the Unda repository it refreshes them before every build; on its own
# it keeps the copies it has. After editing deploy/INSTALL.md,
# unda.example.yaml or deploy/caddy/*, run it (or build) and commit shared/.
set -e
cd "$(dirname "$0")"
root=..
if [ ! -f "$root/deploy/INSTALL.md" ]; then
  echo "sync.sh: not inside the Unda repository; using the copies in shared/"
  exit 0
fi
mkdir -p shared/caddy
cp "$root/deploy/INSTALL.md" shared/INSTALL.md
cp "$root/unda.example.yaml" shared/unda.example.yaml
cp "$root/deploy/caddy/docker-compose.yml" "$root/deploy/caddy/Caddyfile" "$root/deploy/caddy/unda.yaml" shared/caddy/
echo "sync.sh: shared/ refreshed from the repository"
