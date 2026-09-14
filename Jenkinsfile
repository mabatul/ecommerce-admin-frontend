// Independent pipeline for this repo only — doesn't depend on infra/backend.
// Not the active CI (see .github/workflows/ci.yml); kept for a Jenkins with
// real resources. Needs a 'railway-token-frontend' Secret text credential.
pipeline {
  agent any

  environment {
    RAILWAY_SERVICE = 'ecommerce-admin-frontend'
    NEXT_PUBLIC_API_URL = 'http://localhost:4000' // point at the real backend URL when deploying
    NODE_OPTIONS = '--max-old-space-size=200' // avoid OOM on constrained Jenkins hosts
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Lint') {
      steps { sh 'npm run lint' }
    }

    stage('Build') {
      steps { sh 'npm run build' }
    }

    // Best effort — Railway builds its own image from Dockerfile.ci.
    stage('Build Docker image') {
      steps {
        sh '''
          if command -v docker >/dev/null 2>&1; then
            docker build -f Dockerfile.ci --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" -t ecommerce-admin-frontend:${BUILD_NUMBER} .
          else
            echo "No Docker daemon available here — skipping."
          fi
        '''
      }
    }

    stage('Deploy to Railway (dev)') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'railway-token-frontend', variable: 'RAILWAY_TOKEN')]) {
          sh '''
            npm i -g @railway/cli
            railway up --service "$RAILWAY_SERVICE" --detach
          '''
        }
      }
    }
  }
}
