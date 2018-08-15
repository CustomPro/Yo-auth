import java.text.SimpleDateFormat

properties([
  parameters([
    string(name: 'gitRepo', defaultValue: 'ssh://git@bucket.multicast-media.com:7999/mtrm/yo-auth.git'),
    string(name: 'realCommitSha', defaultValue: ''),
    string(name: 'realBranchName', defaultValue: ''),
    string(name: 'registryURL', defaultValue: 'https://services.multicast-media.com:5000/'),
    string(name: 'registryName', defaultValue: 'services.multicast-media.com:5000'),
    string(name: 'imageName', defaultValue: 'yo-auth'),
    string(name: 'gitCredentials', defaultValue: 'deployer-creds')]),

  pipelineTriggers([
     [$class: 'GenericTrigger',
         genericVariables: [
             [key: 'newBranchName', value: '$.changes[:1].ref.displayId', expressionType: 'JSONPath', regexpFilter: '[^a-zA-Z0-9_.-]'],
             [key: 'newCommitSha', value: '$.changes[:1].toHash', expressionType: 'JSONPath', regexpFilter: '[^a-zA-Z0-9_.-]']
         ],
         printContributedVariables: true,
         printPostContent: true,]
    ])
])

def branchName = env.realBranchName ?: "${newBranchName}"
if( "${branchName}" != "master" ) {
   echo "Aborting Build branch isn't master, with current settings, only master branch can be build"
   currentBuild.result = 'ABORTED'
   return
}

def commit = env.realCommitSha ?: "${newCommitSha}"
node ('jenkins slave') {
    stage('Checkout') {
        checkout ( [$class: 'GitSCM',
            branches: [[name: commit ]],
            userRemoteConfigs: [[
                credentialsId: params.gitCredentials, 
                url: params.gitRepo]]])
    } 

    stage('Build image') {
        def dateFormat = new SimpleDateFormat("yyyyMMdd")
        def timeStamp = new Date()
        def shortSha = commit.take(8)
        try {         
            withDockerRegistry([credentialsId: 'multicast-docker-registry', url: params.registryURL]) {
                def imageFullName = "${env.registryName}/${env.imageName}"
                def imageTag = "${dateFormat.format(timeStamp)}-${branchName}-${shortSha}"
                def image = docker.build("${imageFullName}:${imageTag}")
                image.push()
                image.push("latest")
                sh "docker rmi -f ${imageFullName}:${imageTag}"
                sh "docker rmi -f ${imageFullName}:latest"
            }
        }
      
        catch (err) {
            println "an error has occurred"
            def images = sh(returnStdout: true, script: '/usr/bin/docker images | grep "^<none>" | awk \'{print $3}\'')
            sh("/usr/bin/docker rmi -f $images")
            throw err;
        }
    }
}

