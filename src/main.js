const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const token = core.getInput('GH_TOKEN', { required: true })
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo
    console.log(`GH_TOKEN ${token}!`)

    const octokit = github.getOctokit(token)

    const headers = {
      'User-Agent': 'Web/2.0',
      Authorization: `Bearer ${token}`
    }

    const graphQLWithAuth = octokit.graphql.defaults({ headers })

    const { repository } = await graphQLWithAuth(`{
        repository(name: "${repo}", owner: "${owner}") {
            name
            nameWithOwner
            description
            licenseInfo {name}
            languages (first: 5, orderBy: {direction: DESC,field: SIZE}){
                edges {
                    node {
                        name
                        color
                    }
                    size
                }
            }
        }
    }`)

    console.log(`Repository: ${JSON.stringify(repository, undefined, 2)}`)

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
