pipeline {
  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
    disableConcurrentBuilds()
  }
  agent any

  environment {
    COMMIT_HASH = GIT_COMMIT.substring(0, 8)
    PROJECT_PREFIX = "${BRANCH_NAME}_${COMMIT_HASH}_${BUILD_NUMBER}_"
    IMAGE_BASE = "docker-registry.secure.amsterdam.nl/mijnams/mijnamsterdam"
    IMAGE_TEST = "${IMAGE_BASE}:test"
    // IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    // IMAGE_ACCEPTANCE_BFF = "${IMAGE_BASE}-bff:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_PRODUCTION_BFF = "${IMAGE_BASE}-bff:production"

    // Client-side data. Not secret.
    // Will be deprecated when we move to AZ.
    // MA_FRONTEND_URL_ACC = "https://acc.mijn.amsterdam.nl"
    MA_FRONTEND_URL_PROD = "https://mijn.amsterdam.nl"

    // MA_FRONTEND_HOST_ACC = "acc.mijn.amsterdam.nl"
    MA_FRONTEND_HOST_PROD = "mijn.amsterdam.nl"

    // MA_API_HOST_ACC = "acc.mijn-bff.amsterdam.nl"
    MA_API_HOST_PROD = "mijn-bff.amsterdam.nl"

    // REACT_APP_BFF_API_URL_ACC = "https://acc.mijn-bff.amsterdam.nl/api/v1"
    REACT_APP_BFF_API_URL_PROD = "https://mijn-bff.amsterdam.nl/api/v1"

    REACT_APP_SENTRY_DSN = "https://82d51b217a684d9482ccef4655ff4890@sentry-new.data.amsterdam.nl/3"
    // REACT_APP_ANALYTICS_ID_ACC = "e63312c0-0efe-4c4f-bba1-3ca1f05374a8"
    REACT_APP_ANALYTICS_ID_PROD = "f558164e-e388-49e0-864e-5f172552789c"
  }

  stages {

    // RUN TESTS

    stage('Unit tests') {
      when {
        not {
          anyOf {
            branch 'test';
            branch 'test-acc';
            branch 'test-acc-bff';
            branch 'test-acc-frontend';
          }
        }
      }
      options {
        timeout(time: 9, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "Unit testing #${BUILD_NUMBER}" }
        sh "docker build -t ${IMAGE_TEST} " +
           "--target=build-deps " +
           "--shm-size 1G " +
           "."
        sh "docker run ${IMAGE_TEST} npm test"
        sh "docker run ${IMAGE_TEST} npm run bff-api:test"
      }
    }

    // ACCEPTANCE

    // stage('Build BFF') {
    //   when {
    //     not {
    //       anyOf {
    //         branch 'production-release-v*';
    //         branch 'test';
    //         branch 'test-acc-frontend';
    //       }
    //     }
    //   }
    //   options {
    //     timeout(time: 10, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "ACC Build BFF #${BUILD_NUMBER}" }
    //     // build the BFF/node image
    //     sh "docker build -t ${IMAGE_ACCEPTANCE_BFF} " +
    //        "--target=deploy-bff " +
    //        "--build-arg MA_FRONTEND_URL=${MA_FRONTEND_URL_ACC} " +
    //        "--build-arg MA_BUILD_ID=${BUILD_NUMBER} " +
    //        "--build-arg MA_GIT_SHA=${COMMIT_HASH} " +
    //        "--build-arg MA_OTAP_ENV=acceptance " +
    //        "--shm-size 1G " +
    //        "."
    //     sh "docker push ${IMAGE_ACCEPTANCE_BFF}"
    //   }
    // }

    // stage('Deploy BFF') {
    //   when {
    //     anyOf {
    //       branch 'main';
    //       branch 'test-acc';
    //       branch 'test-acc-bff';
    //     }
    //   }
    //   options {
    //     timeout(time: 10, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "ACC Deploy BFF #${BUILD_NUMBER}" }
    //     // Build the BFF
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy.yml'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_mijnamsterdam-bff"]
    //     ]
    //   }
    // }

    // stage('Build Front-end') {
    //   when {
    //     not {
    //       anyOf {
    //         branch 'production-release-v*';
    //         branch 'test';
    //         branch 'test-acc-bff';
    //       }
    //     }
    //   }
    //   options {
    //     timeout(time: 10, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "ACC Build Front-end #${BUILD_NUMBER}" }
    //     // build the Front-end/nginx image
    //     sh "docker build -t ${IMAGE_ACCEPTANCE} " +
    //        "--build-arg MA_OTAP_ENV=acceptance " +
    //        "--build-arg MA_FRONTEND_HOST=${MA_FRONTEND_HOST_ACC} " +
    //        "--build-arg MA_API_HOST=${MA_API_HOST_ACC} " +
    //        "--build-arg MA_BUILD_ID=${BUILD_NUMBER} " +
    //        "--build-arg MA_GIT_SHA=${COMMIT_HASH} " +
    //        "--build-arg REACT_APP_BFF_API_URL=${REACT_APP_BFF_API_URL_ACC} " +
    //        "--build-arg REACT_APP_SENTRY_DSN=${REACT_APP_SENTRY_DSN} " +
    //        "--build-arg REACT_APP_ANALYTICS_ID=${REACT_APP_ANALYTICS_ID_ACC} " +
    //        "--target=deploy-frontend " +
    //        "--shm-size 1G " +
    //        "."
    //     sh "docker push ${IMAGE_ACCEPTANCE}"
    //   }
    // }

    // stage('Deploy Front-end') {
    //   when {
    //     anyOf {
    //       branch 'main';
    //       branch 'test-acc';
    //       branch 'test-acc-frontend';
    //     }
    //   }
    //   options {
    //     timeout(time: 10, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "ACC Deploy #${BUILD_NUMBER}" }
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy.yml'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_mijnamsterdam"]
    //     ]
       
    //   }
    // }

    // PRODUCTION

    stage('Build PROD') {
      when {
        branch 'production-release-v*'
      }
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "PROD:Build:#${BUILD_NUMBER}" }

        // build the Front-end/nginx image
        sh "docker build -t ${IMAGE_PRODUCTION} " +
           "--build-arg MA_OTAP_ENV=production " +
           "--build-arg MA_FRONTEND_HOST=${MA_FRONTEND_HOST_PROD} " +
           "--build-arg MA_API_HOST=${MA_API_HOST_PROD} " +
           "--build-arg MA_BUILD_ID=${BUILD_NUMBER} " +
           "--build-arg MA_FRONTEND_URL=${MA_FRONTEND_URL_PROD} " +
           "--build-arg MA_GIT_SHA=${COMMIT_HASH} " +
           "--build-arg REACT_APP_BFF_API_URL=${REACT_APP_BFF_API_URL_PROD} " +
           "--build-arg REACT_APP_SENTRY_DSN=${REACT_APP_SENTRY_DSN} " +
           "--build-arg REACT_APP_ANALYTICS_ID=${REACT_APP_ANALYTICS_ID_PROD} " +
           "--target=deploy-production-frontend " +
           "--shm-size 1G " +
           "."

        sh "docker push ${IMAGE_PRODUCTION}"

        // Build the BFF production image
        sh "docker build -t ${IMAGE_PRODUCTION_BFF} " +
           "--build-arg MA_FRONTEND_URL=${MA_FRONTEND_URL_PROD} " +
           "--build-arg MA_BUILD_ID=${BUILD_NUMBER} " +
           "--build-arg MA_GIT_SHA=${COMMIT_HASH} " +
           "--build-arg MA_OTAP_ENV=production " +
           "--target=deploy-bff " +
           "--shm-size 1G " +
           "."
        sh "docker push ${IMAGE_PRODUCTION_BFF}"
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
        script { currentBuild.displayName = "PROD:Deploy approval:#${BUILD_NUMBER}" }
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
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "PROD:Deploy:#${BUILD_NUMBER}" }

         // Build the BFF
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy.yml'],
          [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_mijnamsterdam-bff"]
        ]

        // Build the FE
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy.yml'],
          [$class: 'StringParameterValue', name: 'PLAYBOOKPARAMS', value: "-e cmdb_id=app_mijnamsterdam"]
        ]
      }
    }
  }

  post {
    success {
      echo 'Pipeline success'
    }
  }
}
