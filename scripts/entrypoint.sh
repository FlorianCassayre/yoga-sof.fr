#!/bin/sh
set -e

case "$1" in
  public)
    exec node /app/public/apps/public/server.js
    ;;
  admin)
    exec node /app/admin/apps/admin/server.js
    ;;
  migrate)
    cd /seed
    exec node node_modules/drizzle-kit/bin.cjs migrate
    ;;
  seed)
    cd /seed
    exec node seed.cjs
    ;;
  truncate-seed)
    cd /seed
    node truncate.cjs
    exec node seed.cjs
    ;;
  *)
    echo "Unknown command: $1" >&2
    echo "Usage: public | admin | migrate | seed | truncate-seed" >&2
    exit 64
    ;;
esac
