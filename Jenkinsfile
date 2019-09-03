pipeline {
  agent any
  options {
    timeout(time: 5, unit: 'DAYS')
  }

  environment {
    COMMIT_HASH = GIT_COMMIT.substring(0, 8)
    PROJECT_PREFIX = "${BRANCH_NAME}_${COMMIT_HASH}_${BUILD_NUMBER}_"
    IMAGE_BASE = "repo.secure.amsterdam.nl/mijnams/mijnamsterdam"
    IMAGE_BUILD = "${IMAGE_BASE}:${BUILD_NUMBER}"
    IMAGE_ACCEPTANCE = "${IMAGE_BASE}:acceptance"
    IMAGE_PRODUCTION = "${IMAGE_BASE}:production"
    IMAGE_TEST = "${IMAGE_BASE}:test"
    IMAGE_LATEST = "${IMAGE_BASE}:latest"
  }

  stages {

    stage('Unit tests') {
      // when { not { branch 'test' } } // Skip unit tests when pushing directly to test (for speed)
      options {
        timeout(time: 30, unit: 'MINUTES')
      }
      environment {
        PROJECT = "${PROJECT_PREFIX}unit"
      }
      steps {
        sh "docker-compose -p ${PROJECT} up --build --exit-code-from test-unit test-unit"
      }
      post {
        always {
          sh "docker-compose -p ${PROJECT} down -v || true"
        }
      }
    }

    // stage('Run tests') {
      //parallel {
        // stage('E2E tests') {
        //   options {
        //     timeout(time: 60, unit: 'MINUTES')
        //   }
        //   environment {
        //     PROJECT                = "${PROJECT_PREFIX}e2e"
        //     USERNAME_EMPLOYEE      = 'atlas.employee@amsterdam.nl'
        //     USERNAME_EMPLOYEE_PLUS = 'atlas.employee.plus@amsterdam.nl'
        //     PASSWORD_EMPLOYEE      = credentials('PASSWORD_EMPLOYEE')
        //     PASSWORD_EMPLOYEE_PLUS = credentials('PASSWORD_EMPLOYEE_PLUS')
        //   }
        //   steps {
        //     sh "docker-compose -p ${PROJECT} up --build --exit-code-from start start"
        //   }
        //   post {
        //     always {
        //        sh "docker-compose -p ${PROJECT} down -v || true"
        //     }
        //   }
        // }
      //}
    // }

    // TEST

    stage('Build TEST') {
      when { branch 'test' }
      options {
        timeout(time: 30, unit: 'MINUTES')
      }
      steps {
        sh "docker build -t ${IMAGE_BUILD} " +
          "--shm-size 1G " +
          "--build-arg BUILD_ENV=test " +
          "."
        sh "docker push ${IMAGE_BUILD}"
      }
    }

    stage('Deploy TEST') {
      when { branch 'test' }
      options {
        timeout(time: 5, unit: 'MINUTES')
      }
      steps {
        sh "docker pull ${IMAGE_BUILD}"
        sh "docker tag ${IMAGE_BUILD} ${IMAGE_TEST}"
        sh "docker push ${IMAGE_TEST}"
        build job: 'Subtask_Openstack_Playbook', parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend-test.yml']
        ]
      }
    }

    // ACCEPTANCE

    stage('Build ACC') {
      when { branch 'master' }
      options {
        timeout(time: 30, unit: 'MINUTES')
      }
      steps {
        sh "docker build -t ${IMAGE_BUILD} " +
          "--shm-size 1G " +
          "--build-arg BUILD_ENV=acceptance " +
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

    // stage('Build PROD') {
    //   when {
    //     branch 'master',
    //     tag 'release-*'
    //   }
    //   options {
    //     timeout(time: 30, unit: 'MINUTES')
    //   }
    //   steps {
    //     // NOTE BUILD_ENV intentionaly not set (using Dockerfile default)
    //     sh "docker build -t ${IMAGE_PRODUCTION} " +
    //         "--shm-size 1G " +
    //         "."
    //     sh "docker tag ${IMAGE_PRODUCTION} ${IMAGE_LATEST}"
    //     sh "docker push ${IMAGE_PRODUCTION}"
    //     sh "docker push ${IMAGE_LATEST}"
    //   }
    // }

    // stage('Waiting for approval PROD Deploy') {
    //   when {
    //     branch 'master',
    //     tag 'release-*'
    //   }
    //   steps {
    //     script {
    //       input "Deploy to Production?"
    //       echo "Okay, moving on"
    //     }
    //   }
    // }

    // stage('Deploy PROD') {
    //   when {
    //     branch 'master',
    //     tag 'release-*'
    //   }
    //   options {
    //     timeout(time: 5, unit: 'MINUTES')
    //   }
    //   steps {
    //     build job: 'Subtask_Openstack_Playbook', parameters: [
    //       [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
    //       [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-client.yml']
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
      // slackSend(
      //   channel: 'ci-channel',
      //   color: 'danger',
      //   message: "${JOB_NAME}: failure ${BUILD_URL}"
      // )
    }
  }
}
