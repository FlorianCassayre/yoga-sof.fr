#!/bin/bash

set -e

cd "$(dirname "$0")/.."

ENV='.env.development'

echo 'WARNING: this script must be run in development environment ONLY.'
echo 'It will replace your local environment database by a snapshot from production.'
echo 'A backup of your local environment will be produced beforehand.'
echo "You are currently on host: $HOSTNAME"

read -p 'Are you SURE you want to proceed? (y/n) ' -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  npm run backup-production
  export $(cat $ENV | xargs)
  SQL_DUMP=$(ssh -q "$PRODUCTION_SSH_HOST" -p "$PRODUCTION_SSH_PORT" "sudo mysqldump $DATABASE_NAME")
  printf '%s\n' "$SQL_DUMP" | sudo mysql "$DATABASE_NAME"
  echo 'Dump imported.'
else
  echo 'Canceling; no changes were made.'
fi
