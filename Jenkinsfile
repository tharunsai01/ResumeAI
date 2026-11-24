// HireSmart AI pipeline: test in parallel, run the live journey on Docker
// Compose, push images, then deploy to Kubernetes after manual approval.
// Required Jenkins credentials:
//   registry-creds (username/password), kubeconfig-hiresmart (secret file)
pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
    disableConcurrentBuilds()
  }
  environment {
    REGISTRY = 'ghcr.io/your-org/hiresmart-ai'
    TAG = "${env.GIT_COMMIT?.take(12) ?: 'local'}"
    COMPOSE_PROJECT_NAME = "hiresmart-ci-${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Test') {
      parallel {
        stage('AI service') {
          agent { docker { image 'python:3.11-slim'; reuseNode true } }
          steps {
            dir('ai-service') {
              sh 'pip install --quiet fastapi uvicorn pydantic pydantic-settings httpx python-multipart pymupdf python-docx scikit-learn numpy pytest'
              sh 'python -m pytest -q --junitxml=pytest.xml'
            }
          }
          post { always { junit allowEmptyResults: true, testResults: 'ai-service/pytest.xml' } }
        }
        stage('Backend') {
          agent { docker { image 'node:22'; reuseNode true } }
          steps {
            dir('backend') {
              sh 'npm ci'
              sh 'npm run typecheck'
              sh 'npm run test:unit'
              sh 'npm run build'
            }
          }
        }
        stage('Frontend') {
          agent { docker { image 'mcr.microsoft.com/playwright:v1.65.1-noble'; reuseNode true } }
          steps {
            dir('frontend') {
              sh 'npm ci'
              sh 'npm run typecheck'
              sh 'npm run build'
              sh "! grep -l -E 'hs-demo-session|installMockAdapter' dist/assets/*.js"
              sh 'CI=true npx playwright test'
            }
          }
        }
      }
    }

    stage('Integration (Compose)') {
      steps {
        sh '''
          cat > .env <<EOF
MONGO_ROOT_USER=ci
MONGO_ROOT_PASSWORD=$(openssl rand -hex 24)
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
AI_SERVICE_TOKEN=$(openssl rand -hex 32)
PUBLIC_URL=http://localhost:8080
SEED_ALLOW_PRODUCTION=true
EOF
          docker compose up -d --build --wait
          docker compose exec -T backend node dist/seed/seed.js
        '''
        // Backend integration suite against the Compose MongoDB
        sh '''
          docker run --rm --network ${COMPOSE_PROJECT_NAME}_data -v "$PWD/backend:/app" -w /app \
            -e MONGO_URI_TEST="mongodb://ci:$(grep MONGO_ROOT_PASSWORD .env | cut -d= -f2)@mongo:27017/hiresmart_it?authSource=admin" \
            node:22 sh -c "npm ci && npm run test:integration"
        '''
        sh '''
          docker run --rm --network host -v "$PWD/frontend:/app" -w /app mcr.microsoft.com/playwright:v1.65.1-noble \
            sh -c "npm ci && E2E_LIVE=1 BASE_URL=http://localhost:8080 npx playwright test"
        '''
      }
      post {
        failure { sh 'docker compose logs --tail=200 || true' }
        always { sh 'docker compose down -v || true; rm -f .env' }
      }
    }

    stage('Push images') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry-creds', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh 'echo "$REG_PASS" | docker login ghcr.io -u "$REG_USER" --password-stdin'
          script {
            ['frontend', 'backend', 'ai-service'].each { svc ->
              sh "docker build -t ${REGISTRY}/${svc}:${TAG} -t ${REGISTRY}/${svc}:latest ${svc}"
              sh "docker push ${REGISTRY}/${svc}:${TAG}"
              sh "docker push ${REGISTRY}/${svc}:latest"
            }
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      when { branch 'main' }
      steps {
        input message: "Deploy ${TAG} to production?", ok: 'Deploy'
        withCredentials([file(credentialsId: 'kubeconfig-hiresmart', variable: 'KUBECONFIG')]) {
          sh '''
            cd k8s
            kubectl kustomize . > /dev/null
            kubectl apply -k .
            for d in frontend backend ai-service; do
              kubectl -n hiresmart set image deploy/$d $d=${REGISTRY}/$d:${TAG}
            done
            kubectl -n hiresmart rollout status deploy/ai-service --timeout=300s
            kubectl -n hiresmart rollout status deploy/backend --timeout=180s
            kubectl -n hiresmart rollout status deploy/frontend --timeout=120s
          '''
        }
      }
    }
  }

  post {
    always { cleanWs(deleteDirs: true, notFailBuild: true) }
  }
}
