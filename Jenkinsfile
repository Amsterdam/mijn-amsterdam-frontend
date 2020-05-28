pipeline {
  options {
    buildDiscarder(logRotator(numToKeepStr: '1'))
  }
  agent any

  environment {
    COMMIT_HASH = GIT_COMMIT.substring(0, 8)
    PROJECT_PREFIX = "${BRANCH_NAME}_${COMMIT_HASH}_${BUILD_NUMBER}_"
    IMAGE_BASE = "docker-registry.secure.amsterdam.nl/mijnams/mijnamsterdam"
    IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    IMAGE_ACCEPTANCE_BFF = "${IMAGE_BASE}-bff:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_PRODUCTION_BFF = "${IMAGE_BASE}-bff:production"
    IMAGE_TEST = "${IMAGE_BASE}:test"
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
        script { currentBuild.displayName = "Unit testing #${BUILD_NUMBER}" }
        // sh "docker-compose -p ${PROJECT} up --build --exit-code-from test-unit-client test-unit-client"
        // sh "docker-compose -p ${PROJECT} up --build --exit-code-from test-unit-bff test-unit-bff"
      }
      post {
        always {
          sh "docker-compose -p ${PROJECT} down -v --rmi local || true"
        }
      }
    }

    // stage('E2E testing') {
    //   when { not { branch 'test' } }
    //   environment {
    //     PROJECT = "${PROJECT_PREFIX}e2e"
    //   }
    //   steps {
    //     script { currentBuild.displayName = "E2E testing #${BUILD_NUMBER}" }
    //     sh "docker-compose -p ${PROJECT} up --build --exit-code-from e2e-testsuite e2e-testsuite"
    //   }
    //   post {
    //     failure {
    //       junit 'cypress/results/test-report-*.xml'
    //     }
    //     always {
    //       sh "docker-compose -p ${PROJECT} down -v --rmi local || true"
    //     }
    //   }
    // }

    // TEST

    stage('Build TEST') {
      when { branch 'test' }
      options {
        timeout(time: 30, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "TEST Build #${BUILD_NUMBER}" }
        sh "docker build -t ${IMAGE_TEST} " +
           "--shm-size 1G " +
           "--target=serve-ot-bff " +
           "."
        sh "docker push ${IMAGE_TEST}"
      }
    }

    stage('Deploy TEST') {
      when { branch 'test' }
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "TEST Deploy #${BUILD_NUMBER}" }
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend-test.yml']
        ]
      }
    }

    // ACCEPTANCE

    stage('Build ACC') {
      when { not { branch 'test' } }
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "ACC Build #${BUILD_NUMBER}" }
        // build the Front-end/nginx image
        // sh "docker build -t ${IMAGE_ACCEPTANCE} " +
        //    "--target=deploy-acceptance-frontend " +
        //    "--shm-size 1G " +
        //    "."
        // sh "docker push ${IMAGE_ACCEPTANCE}"

        // build the BFF/node image
        sh "docker build -t ${IMAGE_ACCEPTANCE_BFF} " +
           "--target=deploy-ap-bff " +
           "--shm-size 1G " +
           "."
        sh "docker push ${IMAGE_ACCEPTANCE_BFF}"
      }
    }

    stage('Deploy ACC') {
      when {
        anyOf {
          branch 'master';
          branch 'test-acc';
        }
      }
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      steps {
        script { currentBuild.displayName = "ACC Deploy #${BUILD_NUMBER}" }
        // build job: 'Subtask_Openstack_Playbook', parameters: [
        //   [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
        //   [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml']
        // ]
        // Build the BFF
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-bff.yml']
        ]
      }
    }

    // PRODUCTION

    // stage('Build PROD') {
    //   when {
    //     branch 'production-release-v*'
    //   }
    //   options {
    //     timeout(time: 10, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "PROD:Build:#${BUILD_NUMBER}" }
    //     sh "docker build -t ${IMAGE_PRODUCTION} " +
    //        "--target=deploy-production-frontend " +
    //        "--shm-size 1G " +
    //        "."
    //     sh "docker push ${IMAGE_PRODUCTION}"

    //     // Build the BFF production image
    //     // TODO: Pull ACC image, re tag and set ENV RUN variables
    //     sh "docker build -t ${IMAGE_PRODUCTION_BFF} " +
    //        "--target=deploy-ap-bff " +
    //        "--shm-size 1G " +
    //        "."
    //     sh "docker push ${IMAGE_PRODUCTION_BFF}"
    //   }
    // }

    // stage('Deploy PROD - Waiting for approval') {
    //   when {
    //     branch 'production-release-v*'
    //   }
    //   options {
    //     timeout(time: 120, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "PROD:Deploy approval:#${BUILD_NUMBER}" }
    //     script {
    //       input "Deploy to Production?"
    //       echo "Okay, moving on"
    //     }
    //   }
    // }

    // stage('Deploy PROD') {
    //   when {
    //     branch 'production-release-v*'
    //   }
    //   options {
    //     timeout(time: 5, unit: 'MINUTES')
    //   }
    //   steps {
    //     script { currentBuild.displayName = "PROD:Deploy:#${BUILD_NUMBER}" }
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml']
    //     ]

    //     // Build the BFF
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-bff.yml']
    //     ]
    //   }
    // }
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
