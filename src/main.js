const core = require('@actions/core')
const github = require('@actions/github')
const { generateLicenseBadge, generateLanguageBadge } = require('./utils')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Constant for GitHub Actions
    const showLicense = core.getBooleanInput('SHOW_LICENSE')
    const showLanguage = core.getBooleanInput('SHOW_LANGUAGE')
    const token = core.getInput('GH_TOKEN', { required: true })

    console.log('SHOW_LICENSE:', showLicense)
    console.log('SHOW_LANGUAGE:', showLanguage)

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    const octokit = github.getOctokit(token)

    const headers = {
      'User-Agent': 'Web/2.0',
      Authorization: `Bearer ${token}`
    }

    const graphQLWithAuth = octokit.graphql.defaults({ headers })

    const badges = []

    const { repository } = await graphQLWithAuth(`{
        repository(name: "${repo}", owner: "${owner}") {
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

    // Generate License Badge
    if (showLicense) {
      badges.push(generateLicenseBadge(repository.licenseInfo))
    }

    // Generate language Badge
    if (showLanguage) {
      badges.push(generateLanguageBadge(repository.languages))
    }

    console.log(JSON.stringify(badges, undefined, 2))

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
