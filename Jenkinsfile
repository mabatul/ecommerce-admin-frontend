// Pipeline for THIS repo only. Triggers and deploys independently of
// infra/backend — doesn't depend on another job having run first.
//
// Deploying to Railway requires a Jenkins credential of type "Secret text"
// with id 'railway-token-frontend' (a Railway Project Token, generated
// from the project dashboard -> Settings -> Tokens) and, optionally, the
// RAILWAY_SERVICE variable if the service name doesn't match Railway's
// default. See README.md.
pipeline {
  agent any

  environment {
    RAILWAY_SERVICE = 'ecommerce-admin-frontend'
    // Baked into the client bundle at build time — point this at the
    // backend's real Railway URL when deploying to dev.
    NEXT_PUBLIC_API_URL = 'http://localhost:4000'
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

    // Best-effort smoke test, not required for the deploy below — Railway
    // builds the image itself from Dockerfile.ci (per railway.json) when
    // 'railway up' runs. Skips itself instead of failing on a Jenkins agent
    // with no Docker daemon available (e.g. this pipeline running on the
    // Railway-hosted Jenkins, not the local one).
    stage('Build Docker image') {
      steps {
        sh '''
          if command -v docker >/dev/null 2>&1; then
            docker build -f Dockerfile.ci --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" -t ecommerce-admin-frontend:${BUILD_NUMBER} .
          else
            echo "No Docker daemon available here — skipping (Railway builds the image itself on deploy)."
          fi
        '''
      }
    }

    // Note: no `when { branch ... }` on purpose — see
    // ecommerce-admin-backend/Jenkinsfile for why. Run manually with
    // "Build Now" when you want to deploy.
    stage('Deploy to Railway (dev)') {
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
