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

    stage("Test") {
        tryStep "test", {
            sh "docker-compose -p mijn_amsterdam_frontend -f docker-compose.yml build && " +
                    "docker-compose -p mijn_amsterdam_frontend -f docker-compose.yml run --rm test"
        }
    }
}

String BRANCH = "${env.BRANCH_NAME}"

if (BRANCH == "master") {
  stage('Waiting for approval') {
      input "Deploy master to ACC?"
  }
}

if (BRANCH == "master" || BRANCH == "test-acc") {

    stage("Build acceptance image") {
        tryStep "build", {
            docker.withRegistry('https://repo.secure.amsterdam.nl', 'docker-registry') {
                def image = docker.build("mijnams/mijnamsterdam:${env.BUILD_NUMBER}", "--build-arg http_proxy=${JENKINS_HTTP_PROXY_STRING} --build-arg https_proxy=${JENKINS_HTTP_PROXY_STRING} .")
                image.push()
            }
        }
    }

    node {
        stage('Push acceptance image') {
            tryStep "image tagging", {
                docker.withRegistry('https://repo.secure.amsterdam.nl', 'docker-registry') {
                    def image = docker.image("mijnams/mijnamsterdam:${env.BUILD_NUMBER}")
                    image.pull()
                    image.push("acceptance")
                }
            }
        }
    }

    node {
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

    // Enable when project is ready for production
    // stage('Waiting for approval') {
    //     slackSend channel: '#ci-channel', color: 'warning', message: 'Mijn Amsterdam Frontend is waiting for Production Release - please confirm'
    //     input "Deploy to Production?"
    // }

    // node {
    //     stage("Build and Push Production image") {
    //         tryStep "build", {
    //             docker.withRegistry('https://repo.secure.amsterdam.nl','docker-registry') {
    //                 def image = docker.build("mijnams/mijnamsterdam:${env.BUILD_NUMBER}")
    //                 image.pull()
    //                 image.push("production")
    //                 image.push("latest")
    //             }
    //         }
    //     }
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
