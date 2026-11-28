#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

db_container="resumeai-ci-$$"
docker run -d --name "$db_container" -p 127.0.0.1::27017 mongo:7.0 >/dev/null
trap 'docker rm -f "$db_container" >/dev/null' EXIT
for attempt in {1..30}; do
  if docker exec "$db_container" mongosh --quiet --eval 'db.adminCommand("ping").ok' >/dev/null 2>&1; then break; fi
  if [ "$attempt" -eq 30 ]; then exit 1; fi
  sleep 2
done
db_address="$(docker port "$db_container" 27017/tcp)"
export MONGODB_URI="mongodb://${db_address}/resumeai_ci"
export NODE_ENV=test
export GROQ_API_KEY="" GEMINI_API_KEY="" AI_SERVICE_URL="" AI_SERVICE_KEY=""
export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
(
  cd backend
  npm ci
  npm run build
  npm run test:unit
  npm run seed
  npm run test:all
  npm run test:login-rate-limit
)
(
  cd ai-service
  npm ci
  for phase in {2..8}; do npm run "test:phase${phase}:offline"; done
)
(
  cd frontend
  npm ci
  npm run build
)
