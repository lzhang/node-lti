const { merge, omit } = require('ramda')

function buildParams(body, query) {
  return omit(
    ['oauth_signature'],
    body.tool_consumer_info_product_family_code === 'canvas' ||
    body.tool_consumer_info_product_family_code === 'schoology'
      ? body
      : merge(body, query)
  )
}

module.exports = buildParams
