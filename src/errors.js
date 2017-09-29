const ExtendableError = require('extendable-error-class')

class LtiSignatureError extends ExtendableError {
  constructor(message) {
    super(message)
    this.name = 'LtiSignatureError'
  }
}
exports.LtiSignatureError = LtiSignatureError

class LtiNonceError extends ExtendableError {
  constructor(message) {
    super(message)
    this.name = 'LtiNonceError'
  }
}
exports.LtiNonceError = LtiNonceError
