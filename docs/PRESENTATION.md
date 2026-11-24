# ResumeAI live demonstration

## Prepare

Use the local feature/capstone-verification checkout. From the repository root, create a private .env with AI_SERVICE_KEY (openssl rand -hex 24), JWT_ACCESS_SECRET (openssl rand -hex 32), and GROQ_API_KEY. Compose defaults to openai/gpt-oss-20b for the AI service. Set GROQ_MODEL if your key uses a different supported model.

Run:

```sh
docker compose -p resumeai-capstone up --build -d --wait
docker compose -p resumeai-capstone ps
docker compose -p resumeai-capstone logs -f ai-service
```

Use a fresh candidate account and a synthetic PDF or DOCX with a recognizable employer, degree and project. If the job list is empty, create a matching job as a recruiter before the demonstration.

## Demonstration order

1. Open the frontend and identify the team roles. Sign in as the candidate, upload the resume, and open View AI Analysis.
2. Confirm a fresh POST /v1/resume/analyze-text 200 in the AI service logs. Show the score, extracted skill evidence, experience, degree and project. Groq extracts facts. The service validates and scores those facts and builds the report.
3. Open the matching job. Show the job-specific match score and the POST /v1/match 200 service log. The job list and recommendation pages have their own scoring logic.
4. Show test results, local Git history, Docker Compose services and the Kubernetes rollout.
5. Open /api/docs/ for Swagger. Import backend/docs/openapi.json into Postman and set the server to your frontend origin plus /api/v1. Use a test account and a local Postman token variable for protected requests.
6. Show Jira issues, Jenkins and webhook deliveries only after those external services are configured and their results verified.

## Jenkins and browser tests

The Jenkinsfile runs scripts/ci.sh on an agent with Bash, Node 22, npm, Docker and OpenSSL. The script creates and removes an isolated MongoDB container, builds the packages, and runs backend and offline AI tests. The local Selenium smoke test instructions are in the README. Run the same CI script from the repository root to reproduce its steps without Jenkins.

For a GitHub webhook, use an authorized Jenkins job connected to the repository and the GitHub plugin. Configure a webhook secret and the Jenkins /github-webhook/ URL on an externally reachable HTTPS endpoint. Verify delivery and the specific job run. A local branch has no remote push event.

## Kubernetes and HTTPS

The Kubernetes base expects the three resumeai-capstone application images and a namespace-scoped resumeai-secrets Secret with AI_SERVICE_KEY, GROQ_API_KEY and JWT_ACCESS_SECRET. For Minikube, load each image with minikube image load. Apply deploy/kubernetes/namespace.yaml first, provision the Secret from your private configuration, then run:

```sh
kubectl apply -k deploy/kubernetes
kubectl -n resumeai-capstone get pods,svc,pvc
kubectl -n resumeai-capstone port-forward svc/frontend 35174:80
```

The optional TLS Compose overlay expects a local directory TLS_DIRECTORY containing localhost.crt and localhost.key. For a local smoke test, use a short-lived self-signed certificate and explicitly trust it in curl with --cacert. Run docker compose with both docker-compose.yml and docker-compose.https.yml. Its HTTPS port defaults to 35443.

For cloud deployment, use a confirmed cluster and registry, replace the local image references, and configure an ingress controller, domain and trusted TLS certificate. Adapt deploy/kubernetes/ingress/ingress.yaml to that host. Use an authenticated MongoDB service, persistent storage, private secrets, and an environment-specific CLIENT_URL. Do not use demo accounts or credentials in a public deployment.
