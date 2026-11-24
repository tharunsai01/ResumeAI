pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }
  stages {
    stage('Build and test') {
      steps {
        sh 'bash scripts/ci.sh'
      }
    }
  }
}
