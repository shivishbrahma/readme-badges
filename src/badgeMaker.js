const core = require('@actions/core')
const fs = require('fs')
const https = require('https')
const env = require('./envManager')

function createBadgeUrl({
  label,
  message,
  labelColor,
  color,
  style,
  logo,
  logoColor
}) {
  let url = `https://img.shields.io/badge/${encodeURI(label)}-${encodeURI(
    message
  )}-${encodeURI(color.toString().replace('#', ''))}?style=${encodeURI(style)}`
  if (logo) {
    url = `${url}&logo=${encodeURI(logo)}`
  }
  if (logoColor) {
    url = `${url}&logoColor=${encodeURI(logoColor.toString().replace('#', ''))}`
  }
  if (labelColor) {
    url = `${url}&labelColor=${encodeURI(
      labelColor.toString().replace('#', '')
    )}`
  }

  return url
}

const licenseTypes = {
  // permissive licenses - not public domain and not copyleft
  permissive: {
    spdxLicenseIds: [
      'AFL-3.0',
      'Apache-2.0',
      'Artistic-2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'BSD-3-Clause-Clear',
      'BSL-1.0',
      'CC-BY-4.0',
      'ECL-2.0',
      'ISC',
      'MIT',
      'MS-PL',
      'NCSA',
      'PostgreSQL',
      'Zlib'
    ],
    aliases: ['BSD', 'Apache 2.0'],
    color: 'green',
    priority: '2'
  },
  // copyleft licenses require 'Disclose source' (https://choosealicense.com/appendix/#disclose-source)
  // or 'Same license' (https://choosealicense.com/appendix/#same-license)
  copyleft: {
    spdxLicenseIds: [
      'AGPL-1.0-only',
      'AGPL-1.0-or-later',
      'AGPL-3.0-only',
      'AGPL-3.0-or-later',
      'CC-BY-SA-4.0',
      'EPL-1.0',
      'EPL-2.0',
      'EUPL-1.1',
      'GPL-1.0-only',
      'GPL-1.0-or-later',
      'GPL-2.0-only',
      'GPL-2.0-or-later',
      'GPL-3.0-only',
      'GPL-3.0-or-later',
      'LGPL-2.0-only',
      'LGPL-2.0-or-later',
      'LGPL-2.1-only',
      'LGPL-2.1-or-later',
      'LGPL-3.0-only',
      'LGPL-3.0-or-later',
      'LPPL-1.3c',
      'MPL-2.0',
      'MS-RL',
      'OFL-1.1',
      'OSL-3.0'
    ],
    aliases: [
      'GPL',
      'GPL-2.0',
      'GPL-3.0',
      'GPLv2',
      'GPLv2+',
      'GPLv3',
      'GPLv3+',
      'LGPL',
      'LGPL-2.1',
      'LGPL-3.0',
      'LGPLv2',
      'LGPLv2+',
      'LGPLv3',
      'LGPLv3+',
      'AGPL-3.0',
      'AGPLv3+',
      'MPL',
      'MPL 1.1',
      'MPL 2.0',
      'EPL'
    ],
    color: 'orange',
    priority: '1'
  },
  // public domain licenses do not require 'License and copyright notice' (https://choosealicense.com/appendix/#include-copyright)
  'public-domain': {
    spdxLicenseIds: ['CC0-1.0', 'Unlicense', 'WTFPL'],
    aliases: ['CC0'],
    color: '#7cd958',
    priority: '3'
  }
}

/**
 * Mapping of licenses to their corresponding color and priority.
 *
 * @type {object}
 */
const licenseToColorMap = {}
for (const licenseType of Object.keys(licenseTypes)) {
  const { spdxLicenseIds, aliases, color, priority } = licenseTypes[licenseType]
  for (const license of spdxLicenseIds) {
    licenseToColorMap[license] = { color, priority }
  }
  for (const license of aliases) {
    licenseToColorMap[license] = { color, priority }
  }
}

function writeToFileFromURL(
  url,
  filepath,
  successCb = () => {},
  failureCb = () => {}
) {
  // Create a write stream to the local file
  const fileStream = fs.createWriteStream(filepath)

  // Make a GET request to the URL
  const request = https.get(url, response => {
    if (response.statusCode !== 200) {
      console.error(
        `HTTP request failed with status code ${response.statusCode}`
      )
      return
    }

    // Pipe the response data to the local file
    response.pipe(fileStream)

    // Handle the 'end' event to know when the file has been fully written
    fileStream.on('finish', () => {
      console.log(`File saved to ${filepath}`)
      fileStream.close()
      successCb()
    })
  })

  // Handle errors, if any
  request.on('error', err => {
    console.error(`Request error: ${err.message}`)
  })

  // Close the write stream if an error occurs
  request.on('socket', socket => {
    socket.on('error', err => {
      console.error(`Socket error: ${err.message}`)
      fileStream.close()
      failureCb()
    })
  })
}

function generateLicenseBadge(licenseInfo) {
  const badgeOptions = {
    label: 'license',
    message: 'not specified',
    labelColor: '#555',
    color: 'lightgrey',
    style: env.badgeStyle
  }

  if (licenseInfo) {
    badgeOptions.message = licenseInfo.spdxId
    badgeOptions.color = licenseToColorMap[licenseInfo.spdxId]
  }

  const badgeUrl = createBadgeUrl(badgeOptions)
  return badgeUrl
}

function generateLanguageBadge(languages, decimalPrecision = 2) {
  const badgeOptions = {
    label: 'language',
    message: 'not found',
    labelColor: '#555',
    color: 'lightgrey',
    style: env.badgeStyle
  }

  if (languages && languages.edges.length > 0) {
    const { node, size } = languages.edges[0]
    badgeOptions.color = node.color
    const colorPercent = ((size * 100) / languages.totalSize).toFixed(
      decimalPrecision
    )
    badgeOptions.message = `${node.name}(${colorPercent}%)`
  }

  const badgeUrl = createBadgeUrl(badgeOptions)
  return badgeUrl
}

module.exports = {
  createBadgeUrl,
  generateLicenseBadge,
  generateLanguageBadge,
  writeToFileFromURL
}
