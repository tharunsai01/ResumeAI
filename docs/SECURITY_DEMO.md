# Security verification

The CI script uses a disposable MongoDB container. It checks role and record ownership, malformed inputs, upload rejection, flagged résumé blocking, audit events, schema validation, and the production login limit. Run it from the repository root.

```sh
bash scripts/ci.sh
```

For Postman, import `Security.postman_collection.json`. Set `baseUrl` to the local demo origin and add a local `candidateToken` from a synthetic candidate sign-in. The collection checks anonymous access, role isolation, validated request IDs, and Helmet. Use the isolated CI test for repeated invalid logins so the live demo is available to other users. The current Nginx configuration shares the backend IP-based limit across requests forwarded by the proxy.

## Authenticated MongoDB

`docker-compose.mongo-auth.yml` adds an authenticated MongoDB instance with a database-scoped application user. Set `MONGO_ROOT_PASSWORD` and `MONGO_APP_PASSWORD` in a private environment file to separate values generated with `openssl rand -hex 24`. The backend URI uses the application user and the application database as its authentication source. Keep MongoDB off publicly exposed ports.

Apply the overlay on a new Compose project or an intentionally provisioned database. The Mongo image creates users during initialization of a fresh data directory. The overlay uses a separate volume so the existing demo data can be backed up and migrated deliberately before switching. Verify connectivity and record counts before using the new database as the main demo.

## Scanning and limits

Run `npm audit` in `backend`, `ai-service`, and `frontend`. The Python code in this repository is the Selenium test runner. Run Bandit over `frontend/tests` and pip-audit against the Selenium environment. The résumé signature and DOCX structure checks do not provide antivirus scanning. Treat rule-based prompt detection as a first layer alongside data separation and strict output validation.
