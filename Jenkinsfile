pipeline {
  agent any
  options {
    disableConcurrentBuilds()
  }
  triggers {
    githubPush()
  }
  stages {
    stage('Build and test') {
      steps {
        sh 'bash scripts/ci.sh'
      }
    }
  }
}
