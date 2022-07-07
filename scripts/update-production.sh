#!/bin/bash

set -e

cd "$(dirname "$0")/.."

git pull --ff-only
npm ci
npm run backup-production
npm run prisma-migrate-production
npm run generate-favicon
npm run build
