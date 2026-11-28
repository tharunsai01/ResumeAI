#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."

if [[ $# != 3 || ( "$1" != backup && "$1" != restore ) ]]; then
  echo 'Usage: bash scripts/data-recovery.sh backup|restore COMPOSE_PROJECT ABSOLUTE_BACKUP_DIRECTORY' >&2
  exit 2
fi
operation=$1
project=$2
directory=$3
[[ "$directory" = /* ]] || { echo 'Use an absolute backup directory.' >&2; exit 2; }
compose=(docker compose -p "$project")

if [[ -n "$("${compose[@]}" ps --status running -q backend)" ]]; then
  echo 'Stop the backend before copying MongoDB and uploads.' >&2
  exit 1
fi

case "$operation" in
  backup)
    mkdir "$directory"
    "${compose[@]}" exec -T mongodb mongodump --quiet --db hiresmart --archive --gzip > "$directory/mongo.archive.gz"
    "${compose[@]}" run --rm --no-deps -T backend tar -C /app/uploads -czf - . > "$directory/uploads.tar.gz"
    (cd "$directory" && shasum -a 256 mongo.archive.gz uploads.tar.gz > SHA256SUMS)
    ;;
  restore)
    (cd "$directory" && shasum -a 256 -c SHA256SUMS)
    "${compose[@]}" exec -T mongodb mongosh hiresmart --quiet --eval 'if (db.getCollectionNames().some(name => db.getCollection(name).estimatedDocumentCount() > 0)) quit(1)' || {
      echo 'Restore requires an empty MongoDB database.' >&2
      exit 1
    }
    "${compose[@]}" run --rm --no-deps -T backend sh -ec 'test -z "$(find /app/uploads -type f -print -quit)"' || {
      echo 'Restore requires an empty upload volume.' >&2
      exit 1
    }
    "${compose[@]}" run --rm --no-deps -T backend tar -C /app/uploads -xzf - < "$directory/uploads.tar.gz"
    "${compose[@]}" exec -T mongodb mongorestore --quiet --nsInclude 'hiresmart.*' --archive --gzip < "$directory/mongo.archive.gz"
    ;;
esac
