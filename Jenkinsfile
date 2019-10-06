pipeline {
  agent any

  environment {
    COMMIT_HASH = GIT_COMMIT.substring(0, 8)
    PROJECT_PREFIX = "${BRANCH_NAME}_${COMMIT_HASH}_${BUILD_NUMBER}_"
    IMAGE_BASE = "repo.secure.amsterdam.nl/mijnams/mijnamsterdam"
    IMAGE_BUILD = "${IMAGE_BASE}:${COMMIT_HASH}"
    IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_TEST = "${IMAGE_BASE}:test"
    IMAGE_LATEST = "${IMAGE_BASE}:latest"
  }

  stages {

    stage('Unit tests') {
      when { not { branch 'test' } } // Skip unit tests when pushing directly to test (for speed)
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      environment {
        PROJECT = "${PROJECT_PREFIX}unit"
      }
      steps {
        script { currentBuild.displayName = "Unit testing #${BUILD_NUMBER} (${COMMIT_HASH})" }
        sh "docker-compose -p ${PROJECT} up --build --exit-code-from test-unit test-unit"
      }
      post {
        always {
          sh "docker-compose -p ${PROJECT} down -v || true"
        }
      }
    }

     stage('E2E testing') {
      // options {
      //   timeout(time: 5, unit: 'MINUTES')
      // }
      environment {
        PROJECT = "${PROJECT_PREFIX}e2e"
      }
      steps {
        script { currentBuild.displayName = "E2E testing #${BUILD_NUMBER} (${COMMIT_HASH})" }
        sh "docker-compose -p ${PROJECT}  -f docker-compose-e2e.yml up --build --exit-code-from e2e e2e"
      }
      post {
        always {
          junit 'cypress/results/cypress-report.xml'
          sh "docker-compose -p ${PROJECT} down -v || true"
        }
      }
    }

    // TEST

    // stage('Build TEST') {
    //   when { branch 'test' }
    //   options {
    //     timeout(time: 30, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "TEST Build #${BUILD_NUMBER} (${COMMIT_HASH})" }
    //     sh "docker build -t ${IMAGE_BUILD} " +
    //       "--shm-size 1G " +
    //       "--build-arg BUILD_ENV=test " +
    //       "--build-arg BUILD_NUMBER=${BUILD_NUMBER} " +
    //       "--build-arg COMMIT_HASH=${COMMIT_HASH} " +
    //       "."
    //     sh "docker push ${IMAGE_BUILD}"
    //   }
    // }

    // stage('Deploy TEST') {
    //   when { branch 'test' }
    //   options {
    //     timeout(time: 5, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "TEST Deploy #${BUILD_NUMBER} (${COMMIT_HASH})" }
    //     sh "docker pull ${IMAGE_BUILD}"
    //     sh "docker tag ${IMAGE_BUILD} ${IMAGE_TEST}"
    //     sh "docker push ${IMAGE_TEST}"
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend-test.yml']
    //     ]
    //   }
    // }

    // ACCEPTANCE

    stage('Build ACC') {
      when { not { branch 'test' } }
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "ACC Build #${BUILD_NUMBER} (${COMMIT_HASH})" }
        sh "docker build -t ${IMAGE_BUILD} " +
          "--shm-size 1G " +
          "--build-arg BUILD_ENV=acceptance " +
          "--build-arg BUILD_NUMBER=${BUILD_NUMBER} " +
          "--build-arg COMMIT_HASH=${COMMIT_HASH} " +
          "."
        sh "docker push ${IMAGE_BUILD}"
      }
    }

    stage('Deploy ACC') {
      when { branch 'master' }
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "ACC Deploy #${BUILD_NUMBER} (${COMMIT_HASH})" }
        sh "docker pull ${IMAGE_BUILD}"
        sh "docker tag ${IMAGE_BUILD} ${IMAGE_ACCEPTANCE}"
        sh "docker push ${IMAGE_ACCEPTANCE}"
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml']
        ]
      }
    }

    // PRODUCTION

    stage('Build PROD') {
      when {
        branch 'production-release-v*'
      }
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "PROD:Build:#${BUILD_NUMBER} (${COMMIT_HASH})" }
        // NOTE BUILD_ENV intentionaly not set (using Dockerfile default)
        sh "docker build -t ${IMAGE_PRODUCTION} " +
            "--shm-size 1G " +
            "."
        sh "docker tag ${IMAGE_PRODUCTION} ${IMAGE_LATEST}"
        sh "docker push ${IMAGE_PRODUCTION}"
        sh "docker push ${IMAGE_LATEST}"
      }
    }

    stage('Deploy PROD - Waiting for approval') {
      when {
        branch 'production-release-v*'
      }
      options {
        timeout(time: 120, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "PROD:Deploy approval:#${BUILD_NUMBER} (${COMMIT_HASH})" }
        script {
          input "Deploy to Production?"
          echo "Okay, moving on"
        }
      }
    }

    stage('Deploy PROD') {
      when {
        branch 'production-release-v*'
      }
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "PROD:Deploy:#${BUILD_NUMBER} (${COMMIT_HASH})" }
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml']
        ]
      }
    }
  }

  post {
    success {
      echo 'Pipeline success'
    }

    failure {
      echo 'Something went wrong while running pipeline'
      slackSend(
        channel: 'ci-channel',
        color: 'danger',
        message: "${JOB_NAME}: failure ${BUILD_URL}"
      )
    }
  }
}
