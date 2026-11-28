pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    skipDefaultCheckout()
    timeout(time: 15, unit: 'MINUTES')
  }

  parameters {
    booleanParam(
      name: 'WATCH_SELENIUM',
      defaultValue: false,
      description: 'Open Chrome on the Jenkins agent and show the candidate walkthrough.'
    )
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend build') {
      steps {
        dir('backend') {
          sh 'npm ci && npm run build'
        }
      }
    }

    stage('Backend unit tests') {
      steps {
        sh '''#!/usr/bin/env bash
set -o pipefail
npm --prefix backend run test:unit 2>&1 | tee unit-results.log
'''
      }
      post {
        always {
          archiveArtifacts artifacts: 'unit-results.log', allowEmptyArchive: true
        }
      }
    }

    stage('Selenium browser workflows') {
      steps {
        sh '''#!/usr/bin/env bash
set -o pipefail
args=()
if [[ "${WATCH_SELENIUM:-false}" == "true" ]]; then
  args+=(--visible)
fi
bash scripts/selenium-ci.sh "${args[@]}" 2>&1 | tee selenium-results.log
'''
      }
      post {
        always {
          archiveArtifacts artifacts: 'selenium-results.log', allowEmptyArchive: true
        }
      }
    }

    stage('Integration and security tests') {
      steps {
        sh '''#!/usr/bin/env bash
set -euo pipefail
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
cd backend
npm run seed
npm run test:all
npm run test:login-rate-limit
'''
      }
    }

    stage('AI service tests') {
      steps {
        dir('ai-service') {
          sh '''#!/usr/bin/env bash
set -euo pipefail
npm ci
for phase in {2..8}; do npm run "test:phase${phase}:offline"; done
'''
        }
      }
    }

    stage('Frontend build') {
      steps {
        dir('frontend') {
          sh 'npm ci && npm run build'
        }
      }
    }
  }
}
