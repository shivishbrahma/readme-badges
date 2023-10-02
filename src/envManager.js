const core = require('@actions/core')

// Constant for GitHub Actions
const showLicense = core.getBooleanInput('SHOW_LICENSE')
const showLanguage = core.getBooleanInput('SHOW_LANGUAGE')
const commitByMe = core.getBooleanInput('COMMIT_BY_ME')
const commitMessage = core.getInput('COMMIT_MESSAGE')
const commitEmail = core.getInput('COMMIT_EMAIL')
const commitUsername = core.getInput('COMMIT_USERNAME')
const token = core.getInput('GH_TOKEN', { required: true })
const badgeStyle = core.getInput('BADGE_STYLE')
const badgeDir = core.getInput('BADGE_DIR')

const badgeFilenames = {
  LICENSE: 'license.svg',
  LANGUAGE: 'language.svg'
}

module.exports = {
  showLicense,
  showLanguage,
  commitByMe,
  commitMessage,
  commitEmail,
  commitUsername,
  badgeDir,
  badgeStyle,
  badgeFilenames,
  token
}
