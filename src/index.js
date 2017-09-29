const checkNonceFromMemory = require('./checkNonce')
const isObject = require('isobject')
const { URL, parse } = require('url')
const buildParams = require('./buildParams')
const { LtiNonceError, LtiSignatureError } = require('./errors')
const { sign } = require('oauth-sign')
const querystring = require('querystring')

function validLti(secret, body, originalUrl, checkNonce = checkNonceFromMemory) {
  if (!secret) {
    throw new TypeError('Parameter secret must be a non-empty string')
  }
  if (!body) {
    throw new TypeError('Parameter body must be a non-empty object')
  }
  if (!body.oauth_consumer_key) {
    throw new TypeError(
      'Parameter body.oauth_consumer_key must be a non-empty string'
    )
  }
  if (!body.oauth_timestamp) {
    throw new TypeError(
      'Parameter body.oauth_timestamp must be a non-empty string'
    )
  }
  if (!body.oauth_nonce) {
    throw new TypeError('Parameter body.oauth_nonce must be a non-empty string')
  }
  if (!body.oauth_signature) {
    throw new TypeError('Parameter body.oauth_signature must be a non-empty string')
  }
  if (!body.oauth_signature_method) {
    throw new TypeError('Parameter body.oauth_signature_method must be a non-empty string')
  }
  if (!body.oauth_version) {
    throw new TypeError(
      'Parameter body.oauth_version must be a non-empty string'
    )
  }
  if (!['1.0', '1.0a'].includes(body.oauth_version)) {
    throw new TypeError(`OAuth version '${body.oauth_version}' is unsupported`)
  }
  if (typeof checkNonce !== 'function') {
    throw new TypeError('Parameter checkNonce must be a function')
  }
  if (!originalUrl) {
    throw new TypeError('Invalid URL')
  }
  let parsedUrl
  if (URL) {
    parsedUrl = new URL(originalUrl)
  } else {
    parsedUrl = parse(originalUrl)
    parsedUrl.searchParams = querystring.parse(parsedUrl.query)
  }
  if (
    !checkNonce(
      body.oauth_consumer_key,
      body.oauth_nonce,
      Number(body.oauth_timestamp)
    )
  ) {
    throw new LtiNonceError('Invalid LTI request due to bad nonce')
  }
  const params = buildParams(body, parsedUrl.searchParams)
  const signature = sign(
    body.oauth_signature_method,
    'POST',
    `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`,
    params,
    secret
  )
  if (signature !== body.oauth_signature) {
    throw new LtiSignatureError(
      `Consumer signature '${body.oauth_signature}' does not match provider signature '${signature}'`
    )
  }
  return true
}

module.exports = validLti
