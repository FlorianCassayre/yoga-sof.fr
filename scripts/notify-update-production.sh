#!/bin/bash

set -e

cd "$(dirname "$0")/.."

curl -X POST https://yoga-sof.fr/api/update \
  -H 'Content-Type: application/json' \
  -d "{\"token\":\"$UPDATE_TOKEN"\"}"
