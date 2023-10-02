const core = require('@actions/core')
const github = require('@actions/github')
const { GithubManager } = require('./github')
const env = require('./envManager')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const githubManager = new GithubManager(env.token)

    const { repository } = await githubManager.graphQL(`{
        repository(name: "${githubManager.repo}", owner: "${githubManager.owner}") {
            name
            nameWithOwner
            description
            licenseInfo {name, spdxId}
            languages (first: 5, orderBy: {direction: DESC,field: SIZE}){
                edges {
                    node {
                        name
                        color
                    }
                    size
                }
                totalSize
            }
        }
    }`)

    const badges = githubManager.updateREADME(repository)
    console.log(JSON.stringify(badges, undefined, 2))

    // git config user.name ${commitUsername}
    // git config user.email ${commitEmail}
    // git commit -m "${commitMessage}"
    // git push --force

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
