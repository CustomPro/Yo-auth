+ [Authorization Server](#yo-auth)
    + [Installation](#install)
+ [Documentation for jenkins job: yo-auth-docker-build](#jj1)
    + [Variables](#Table1)
+ [Documentation for jenkins job: stack_deploy-update](jj2)
    + [Variables](#Table2)

# <a name="yo-auth"></a> Authorization Server
==================

This is the authorization server example. 

## <a name="install"></a> Installation
```
npm install
npm start
```

See the curl folder for headless operations and ad-hoc testing  
[curl/README.md](curl/README.md)

## <a name="jj1"></a> Documentation for jenkins job: yo-auth-docker-build

This job automatically builds docker image from [yo-auth repository](https://bucket.multicast-media.com/projects/MTRM/repos/yo-auth/browse), when you pushing something, no matter what, in repository and pushed it to [docker registry](https://services.multicast-media.com:9443/).
You can start this job manually in Jenkins UI, for this you need to specify following [variables](#Table1)

#### <a name="Table1"></a> Variables

| Variable name | Variables description | Default Value |
| ------------- | --------------------- | ------------- |
| gitRepo | A link to the repository from which the image will be compiled (in the repository should be Dockerfile) | ssh://git@bucket.multicast-media.com:7999/mtrm/yoxxy-stt.git |
| realCommitSha | Full commit SHA, from which the image will be builded | not specified |
| registryURL | Docker private registry address, where the image will be pushed | https://services.multicast-media.com:5000/ |
| registryName | Docker private registry name (It is necessary for the image to be in the repository) | services.multicast-media.com:5000 |
| imageName | Docker image name | yo-auth |
| gitCredentials | Credentials ID for accessing the repository from which the image will be created | deployer-creds |

## <a name="jj2"></a> Documentation for jenkins job: stack_deploy-update

This job automatically deploy/update swarm cluster, when a new image yoxxy-stt or yo-auth appears in the [docker registry](https://services.multicast-media.com:5000/) branch master.
You can start this job manually in Jenkins UI, for this you need to specify following [variables](#Table2).

#### <a name="Table2"></a> Variables

| Variable name | Variables description | Default Value |
| ------------- | --------------------- | ------------- |
| roleToPlay | Ansible role name which will be used | swarm-cluster-deploy |
| sshCredentialsId | Credentials ID for accessing the server where role will be used | deployer-creds |
| BRANCH_NAME | Branch name from which the role will be cloned | master |
| infraGitRepo | Git repository address from which the role will be cloned | ssh://git@bucket.multicast-media.com:7999/infra/workloads.git |
| infraGitCredentials | Credentials ID for accessing the repository from which the role will be cloned | deployer-creds |
| limitString | The ability to restrict the execution of a role for a specific server | * (all servers) |
| vaultCredentialsId | Credentials ID in order to read the encrypted file | ansible-vault-credentials |
| realImageName | Docker image name (only yoxxy-stt or yo-auth will be accepted) | not specified |
| realBranchName | The name of the branch from which was builded the docker image (only master will be accepted) | not specified |
