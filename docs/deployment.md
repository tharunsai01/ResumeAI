# Deployment

Three supported paths:

| Path | Use it for | Guide |
|---|---|---|
| Local processes | Development with hot reload | below |
| Docker Compose | A full stack on one machine, demos, CI | [docker-guide.md](docker-guide.md) |
| Kubernetes | Production | [kubernetes-guide.md](kubernetes-guide.md) |

## Local development

Requirements: Node.js 20+, Python 3.11+, MongoDB 6+ (local or Atlas).

```bash
# 1. AI service
cd ai-service
python -m venv .venv && source .venv/bin/activate
pip install --index-url https://download.pytorch.org/whl/cpu torch   # optional, enables MiniLM
pip install -r requirements-dev.txt
cp .env.example .env            # set INTERNAL_SERVICE_TOKEN
uvicorn app.main:app --reload --port 8000

# 2. Backend
cd backend
npm install
cp .env.example .env            # set JWT secrets, AI_SERVICE_TOKEN (same as above), MONGO_URI
npm run seed                    # optional demo data
npm run dev                     # http://localhost:5000

# 3. Frontend
cd frontend
npm install
npm run dev                     # http://localhost:5173, proxies /api to :5000
```

Without torch installed, the AI service runs with the TF-IDF fallback and reports it in `/health` and in every match result.

To explore the UI without any backend, run `npm run dev:mock` in `frontend/`. It uses an in-browser sample data layer, shows a "Demo data" banner, and is never included in normal builds.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `MONGO_URI` | yes | `mongodb://127.0.0.1:27017/hiresmart` | |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | yes | | 32+ characters each, different values |
| `AI_SERVICE_URL` | | `http://127.0.0.1:8000` | |
| `AI_SERVICE_TOKEN` | yes | | 16+ characters, must equal the AI service's `INTERNAL_SERVICE_TOKEN` |
| `CORS_ORIGINS` | | `http://localhost:5173` | Comma separated |
| `FRONTEND_URL`, `PUBLIC_API_URL` | | | Used for OAuth redirects |
| `ACCESS_TOKEN_TTL` | | `15m` | |
| `REFRESH_TOKEN_DAYS` | | `7` | |
| `UPLOAD_DIR`, `MAX_UPLOAD_MB` | | `uploads`, `5` | |
| `GOOGLE_CLIENT_ID/SECRET`, `LINKEDIN_CLIENT_ID/SECRET` | | empty | Social sign-in stays disabled until set |
| `TRUST_PROXY` | | `0` | Set to `1` behind Nginx or an Ingress |
| `AUDIT_RETENTION_DAYS` | | `365` | |

The server refuses to start with missing or weak secrets and prints which ones.

### AI service (`ai-service/.env`)

`INTERNAL_SERVICE_TOKEN` (required), `GROQ_API_KEY` (optional), `GROQ_MODEL`, `LLM_ENABLED`, `EMBEDDINGS_ENABLED`, `EMBEDDING_MODEL`, `MAX_FILE_MB`.

### Frontend

`VITE_API_URL` (default `/api/v1`), `VITE_PROXY_TARGET` (dev only), `VITE_CONTACT_EMAIL` and `VITE_GITHUB_URL` (optional footer links).

## OAuth setup

Register these redirect URIs with each provider:

- Google: `${PUBLIC_API_URL}/api/v1/auth/oauth/google/callback`, scopes `openid email profile`
- LinkedIn (Sign In with LinkedIn using OpenID Connect): `${PUBLIC_API_URL}/api/v1/auth/oauth/linkedin/callback`, scopes `openid profile email`

An existing account is linked to a provider only when the provider reports the email as verified.

## Production checklist

- [ ] Unique, random secrets; never reuse the example values
- [ ] HTTPS end to end (the refresh cookie is `Secure` when `NODE_ENV=production`)
- [ ] `CORS_ORIGINS`, `FRONTEND_URL` and `PUBLIC_API_URL` set to the real domain
- [ ] MongoDB with authentication, backups and encryption at rest
- [ ] Encrypted volume (or object storage) for resumes
- [ ] `TRUST_PROXY` matches the number of proxies in front of the API
- [ ] Do not run `seed` against production data
