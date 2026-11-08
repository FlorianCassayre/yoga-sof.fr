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
    exec node migrate.cjs
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
  truncate-import)
    cd /seed
    exec node import.cjs db.sql
    ;;
  *)
    echo "Unknown command: $1" >&2
    echo "Usage: public | admin | migrate | seed | truncate-seed | truncate-import" >&2
    exit 64
    ;;
esac
