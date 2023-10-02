const { simpleGit } = require('simple-git')
const path = require('path')
const fs = require('fs')
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
    this.__REPO_PATH = `https://${env.token}@${this.githubHost}/${this.__REMOTE_NAME}.git`

    if (fs.existsSync(this.clone_path)) {
      fs.rmSync(this.clone_path, { force: true, recursive: true })
    }

    this.__gitRepo = simpleGit()
    await this.__gitRepo.clone(this.__REPO_PATH, this.clone_path)
    console.log('Git Repo cloned')

    const branch = (await this.__gitRepo.branch()).current
    console.log('Current Branch:', branch)
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
      const filePath = path.join(
        this.clone_path,
        env.badgeDir,
        env.badgeFilenames[badgeType]
      )
      badges[badgeType]['filepath'] = filePath
    //   badgeMaker.writeToFileFromURL(badges[badgeType].url, filePath, () => {
    //     this.__gitRepo.add(filePath)
    //   })
    }

    // await this.__gitRepo
    //   .addConfig('user.name', env.commitUsername)
    //   .addConfig('user.email', env.commitEmail)
    //   .commit(env.commitMessage)
    //   .push()

    // console.log('Changes commited...')

    return badges
  }
}

module.exports = {
  GithubManager
}
