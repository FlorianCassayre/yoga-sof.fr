#!/bin/bash

set -e

cd "$(dirname "$0")/.."

ENV='.env.production'
FILE_NAME="$(date +"%Y%m%d%H%M%S").sql"
DIRECTORY='backups'

mkdir -p "$DIRECTORY"

export $(cat $ENV | xargs)
mysqldump "$DATABASE_NAME" -u "$DATABASE_USER" --password="$DATABASE_PASSWORD" > "$DIRECTORY/$FILE_NAME"

echo "Wrote a backup in file $FILE_NAME"
