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
4. Show the Git branch, Docker Compose services, and unit and Selenium results. Use the HTTPS demo URL to show the Nginx TLS proxy.
5. Open `/api/docs/` in Swagger, expand `GET /health`, and click **Try it out** then **Execute**. Swagger lists the backend routes and lets you run them from the browser. In Postman, import `docs/ResumeAI.postman_collection.json`, set `baseUrl` to the frontend origin, and run the three checks.
6. Show Jira issues, Jenkins and webhook deliveries only after those external services are configured and their results verified.

## Jenkins and browser tests

The Jenkinsfile runs scripts/ci.sh on an agent with Bash, Node 22, npm, Docker and OpenSSL. The script creates and removes an isolated MongoDB container, builds the packages, and runs backend unit, integration, and workflow tests plus offline AI tests. Run the backend unit tests alone with `npm --prefix backend run test:unit`. The local Selenium smoke test instructions are in the README. Run the same CI script from the repository root to reproduce its steps without Jenkins.

Create a Jenkins Pipeline from SCM for the demo branch with the Pipeline, Git, and GitHub plugins installed. Run it manually once to load the trigger in the Jenkinsfile. With GitHub repository webhook access, set up a push-event hook with a secret and use the externally reachable Jenkins HTTPS URL ending in `/github-webhook/`. Verify the successful delivery in GitHub and the corresponding branch and commit in Jenkins.

## Local HTTPS

The TLS Compose overlay expects a local directory `TLS_DIRECTORY` containing `localhost.crt` and `localhost.key`. Run Docker Compose with both `docker-compose.yml` and `docker-compose.https.yml`. Open `https://localhost:35443` after trusting the local certificate, or verify the API from the terminal:

```sh
curl --cacert "$TLS_DIRECTORY/localhost.crt" https://localhost:35443/api/v1/health
```
