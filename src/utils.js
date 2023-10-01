const { makeBadge, ValidationError } = require('badge-maker')
const core = require('@actions/core')
const badgeStyle = core.getInput('BADGE_STYLE')
const badgeDir = core.getInput('BADGE_DIR')
const fs = require('fs')
const path = require('path')

function createBadgeUrl(
  title,
  desc,
  descColor,
  style = 'flat', // flat, flat-square, plastic, for-the-badge, social
  logo = null,
  logoColor = null,
  label = null,
  labelColor = null,
  color = null
) {
  let url = `https://img.shields.io/badge/${encodeURI(title)}-${encodeURI(
    desc
  )}-${encodeURI(descColor)}?style=${encodeURI(style)}`

  if (logo) {
    url = `${url}&logo=${encodeURI(logo)}`
  }
  if (logoColor) {
    url = `${url}&logoColor=${encodeURI(logoColor)}`
  }
  if (label) {
    url = `${url}&label=${encodeURI(label)}`
  }
  if (labelColor) {
    url = `${url}&labelColor=${encodeURI(labelColor)}`
  }
  if (color) {
    url = `${url}&color=${encodeURI(color)}`
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

function generateLicenseBadge(licenseInfo, filename = 'license.svg') {
  const badgeOptions = {
    label: 'license',
    message: 'not specified',
    labelColor: '#555',
    color: 'lightgrey',
    style: badgeStyle
  }

  if (licenseInfo) {
    badgeOptions.message = licenseInfo.spdxId
    badgeOptions.color = licenseToColorMap[licenseInfo.spdxId]
  }

  const svgContent = makeBadge(badgeOptions)
  const filePath = path.join(badgeDir, filename)
  fs.writeFileSync(filePath, svgContent)
  console.log(`Badge successfully written at ${filePath}`)

  return svgContent
}

function generateLanguageBadge(
  languages,
  filename = 'language.svg',
  decimalPrecision = 2
) {
  const badgeOptions = {
    label: 'language',
    message: 'not found',
    labelColor: '#555',
    color: 'lightgrey',
    style: badgeStyle
  }

  if (languages && languages.edges.length > 0) {
    const { node, size } = languages.edges[0]
    badgeOptions.color = node.color
    const colorPercent = ((size * 100) / languages.totalSize).toFixed(
      decimalPrecision
    )
    badgeOptions.message = `${node.name}(${colorPercent}%)`
  }

  const svgContent = makeBadge(badgeOptions)
  const filePath = path.join(badgeDir, filename)
  fs.writeFileSync(filePath, svgContent)
  console.log(`Badge successfully written at ${filePath}`)

  return svgContent
}

module.exports = {
  createBadgeUrl,
  generateLicenseBadge,
  generateLanguageBadge
}
