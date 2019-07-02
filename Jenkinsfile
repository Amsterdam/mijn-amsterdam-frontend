#!groovy

def tryStep(String message, Closure block, Closure tearDown = null) {
  try {
    block()
  }
  catch (Throwable t) {
    slackSend message: "${env.JOB_NAME}: ${message} failure ${env.BUILD_URL}", channel: '#ci-channel', color: 'danger'

    throw t
  }
  finally {
    if (tearDown) {
      tearDown()
    }
  }
}

node {
  stage("Checkout") {
    checkout scm
  }

  if (BRANCH != "test-acc") {
    stage("Test") {
      tryStep "test", {
        sh "docker-compose -p mijn_amsterdam_frontend -f docker-compose.yml build && " +
        "docker-compose -p mijn_amsterdam_frontend -f docker-compose.yml run --rm test"
      }
    }
  }
}

String BRANCH = "${env.BRANCH_NAME}"
String DEV_TARGET = "acceptance"
String PROD_TARGET = "production"

if (BRANCH == "test") {
  DEV_TARGET = "test"
}

if (BRANCH == "master") {
  stage('Waiting for approval') {
    input "Deploy master to ACC?"
  }
}

if (BRANCH == "master" || BRANCH == "test-acc" || BRANCH == "test") {

  stage("Build image (test/acc)") {
    tryStep "build", {
      docker.withRegistry("${DOCKER_REGISTRY}", 'docker-registry') {
      def image = docker.build("mijnams/mijnamsterdam:${env.BUILD_NUMBER}", "--build-arg PROD_ENV=${DEV_TARGET} --build-arg http_proxy=${JENKINS_HTTP_PROXY_STRING} --build-arg https_proxy=${JENKINS_HTTP_PROXY_STRING} .")
      image.push()
    }
  }
}

node {
  stage('Push image (test/acc)') {
    tryStep "image tagging", {
      docker.withRegistry("${DOCKER_REGISTRY}", 'docker-registry') {

        def image = docker.image("mijnams/mijnamsterdam:${env.BUILD_NUMBER}")
        image.pull()

        if (BRANCH == "master" || BRANCH == "test-acc") {
          image.push("acceptance")
        }
        if (BRANCH == "test") {
          image.push("test")
        }
      }
    }
  }
}

node {

  if (BRANCH == "master" || BRANCH == "test-acc") {
    stage("Deploy to ACC") {
      tryStep "deployment", {
        build job: 'Subtask_Openstack_Playbook',
        parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml'],
        ]
      }
    }
  }

  if (BRANCH == "test") {
    stage("Deploy to TEST") {
      tryStep "deployment", {
        build job: 'Subtask_Openstack_Playbook',
        parameters: [
          [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
          [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend-test.yml'],
        ]
      }
    }
  }
}

// Enable when project is ready for production
// stage('Waiting for approval') {
//     slackSend channel: '#ci-channel', color: 'warning', message: 'Mijn Amsterdam Frontend is waiting for Production Release - please confirm'
//     input "Deploy to Production?"
// }

// node {
//   stage("Build and Push Production image") {
//     tryStep "build", {
//       docker.withRegistry("${DOCKER_REGISTRY}",'docker-registry') {
//         def image = docker.build("mijnams/mijnamsterdam:${env.BUILD_NUMBER}", "--build-arg PROD_ENV=${PROD_TARGET}  --build-arg http_proxy=${JENKINS_HTTP_PROXY_STRING} --build-arg https_proxy=${JENKINS_HTTP_PROXY_STRING} .")
//         image.pull()
//         image.push("production")
//         image.push("latest")
//       }
//     }
//   }
// }

// node {
//     stage("Deploy to PROD") {
//         tryStep "deployment", {
//             build job: 'Subtask_Openstack_Playbook',
//             parameters: [
//                 [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
//                 [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-mijnamsterdam-frontend.yml'],
//             ]
//         }
//     }
// }
}
