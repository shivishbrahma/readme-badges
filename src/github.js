const { simpleGit } = require('simple-git')
const path = require('path')
const github = require('@actions/github')
const env = require('./envManager')
const badgeMaker = require('./badgeMaker')

class GithubManager {
  constructor() {
    this.clone_path = 'repo'
    this.octokit = github.getOctokit(env.token)
    this.graphQL = this.octokit.graphql
    this.githubHost = 'github.com'
    this.repo = github.context.repo.repo
    this.owner = github.context.repo.owner
    this.__REMOTE_NAME = `${this.owner}/${this.repo}`
    this.init()
  }

  async init() {
    this.user = await this.octokit.rest.users.getAuthenticated()
    this.__REPO_PATH = `https://${env.token}@${this.githubHost}/${this.__REMOTE_NAME}.git`
    // await simpleGit()
    //   .addConfig('user.name', env.commitUsername)
    //   .addConfig('user.email', env.commitEmail)
    this.__gitRepo = simpleGit(__dirname)
    const isRepo = await this.__gitRepo.checkIsRepo()
    if (isRepo) console.log('This is a git repo')
    else console.log('Not a Repo')
  }

  async updateREADME(data) {
    const badges = {}

    // Generate License Badge
    if (env.showLicense) {
      badges['LICENSE'] = {
        url: badgeMaker.generateLicenseBadge(data.licenseInfo)
      }
    }

    // Generate language Badge
    if (env.showLanguage) {
      badges['LANGUAGE'] = {
        url: badgeMaker.generateLanguageBadge(data.languages)
      }
    }

    // const filePath = path.join(badgeDir, filename)
    // writeToFileFromURL(badgeUrl, filePath)
    for (const badgeType of Object.keys(badges)) {
      const filePath = path.join(env.badgeDir, env.badgeFilenames[badgeType])
      badges[badgeType]['filepath'] = filePath
      //   writeToFileFromURL(badges[badgeType].url, filePath, () => {
      //     simpleGit().add(filePath)
      //   })
    }

    return badges
  }
}

module.exports = {
  GithubManager
}
