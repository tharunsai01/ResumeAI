# Docker guide

## Start the stack

```bash
cp .env.example .env
# Replace every change-me value, for example with: openssl rand -base64 48
docker compose up -d --build --wait
docker compose exec backend node dist/seed/seed.js     # optional demo data
open http://localhost:8080
```

`--wait` returns once every service reports healthy. The first build downloads CPU-only PyTorch and the MiniLM weights into the AI image (about 1 GB). Set `PRELOAD_MODEL=false` in `.env` for a smaller image that uses the TF-IDF fallback.

## Services

| Service | Image | Network | Port | Health check |
|---|---|---|---|---|
| `frontend` | `frontend/Dockerfile` (Node build, `nginx-unprivileged` runtime) | web | 8080 published | `/healthz` |
| `backend` | `backend/Dockerfile` (multi-stage, `node:22-alpine`, tini) | web, data, ai | internal 5000 | `/health` (includes a DB ping) |
| `ai-service` | `ai-service/Dockerfile` (`python:3.11-slim`, CPU torch, MiniLM baked in) | ai | internal 8000 | `/health` |
| `mongo` | `mongo:7.0` | data | internal 27017 | `db.adminCommand('ping')` |

`data` and `ai` are `internal` networks: the database and the AI service cannot be reached from the host or from the frontend container.

Startup order is enforced with `depends_on: condition: service_healthy`: mongo and ai-service, then backend, then frontend.

## Hardening applied

- `restart: unless-stopped`
- `no-new-privileges`, all Linux capabilities dropped (Mongo gets back only what its entrypoint needs)
- Read-only root filesystems with a `tmpfs` at `/tmp` for frontend, backend and AI service
- Non-root users in every image (`node`, `aiuser` uid 10001, nginx uid 101)
- AI service memory limit 2 GB

## Volumes

| Volume | Contents |
|---|---|
| `mongo-data` | Database files |
| `uploads` | Resume files (`/app/uploads/<userId>/<uuid>.pdf`) |

Back up both. `docker compose down` keeps them; `docker compose down -v` deletes them.

## Common tasks

```bash
docker compose logs -f backend ai-service        # follow logs
docker compose exec backend node dist/seed/seed.js
docker compose up -d --build backend             # rebuild one service
docker compose exec mongo mongosh -u "$MONGO_ROOT_USER" -p "$MONGO_ROOT_PASSWORD"
```

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| backend exits with "Invalid environment configuration" | A secret in `.env` is missing or shorter than 32 (JWT) or 16 (AI token) characters |
| Resume stuck on "Extracting text" then fails | AI service unhealthy or the tokens differ; check `docker compose logs ai-service` |
| `/health` on the AI service shows `tfidf-fallback` | Image built with `PRELOAD_MODEL=false`, or the weights failed to download at build time |
| OAuth buttons disabled | Provider credentials not set; this is expected |
