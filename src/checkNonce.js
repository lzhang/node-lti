const { LtiNonceError } = require('./errors')

const nonces = {}
const NONCE_EXPIRATION = 600

function checkNonceFromMemory(key, nonce, timestamp) {
  if (!key) {
    throw new TypeError('Parameter key is required')
  }
  if (!nonce) {
    throw new TypeError('Parameter nonce is required')
  }
  if (!timestamp) {
    throw new TypeError('Parameter timestamp is required')
  }
  const nowInSec = Date.now() / 1000
  if (!nonces[key]) {
    nonces[key] = []
  }
  if (timestamp > nowInSec) {
    throw new LtiNonceError(
      `Invalid LTI request due to nonce from the future: '${timestamp}' > '${nowInSec}'`
    )
  }
  if (nowInSec - timestamp > NONCE_EXPIRATION) {
    throw new LtiNonceError(
      `Invalid LTI request due to expired nonce timestamp '${timestamp}'`
    )
  }
  nonces[key] = nonces[key].filter(
    entry => nowInSec - entry.timestamp < NONCE_EXPIRATION
  )
  if (nonces[key].find(entry => entry.nonce === nonce)) {
    throw new LtiNonceError(
      `Invalid LTI request due to duplicate nonce '${nonce}'`
    )
  }
  nonces[key].push({ nonce, timestamp })
  return true
}

module.exports = checkNonceFromMemory
