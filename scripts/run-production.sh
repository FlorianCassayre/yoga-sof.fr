#!/bin/bash

set -e

cd "$(dirname "$0")/.."

while true
do
  npm run update-production
  npm run start-production
done
