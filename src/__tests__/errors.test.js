const { LtiSignatureError, LtiNonceError } = require('../errors')

describe('errors', () => {
  test('should export LtiSignatureError', () => {
    expect(LtiSignatureError.name === 'LtiSignatureError').toBe(true)
  })

  test('should export LtiNonceError', () => {
    expect(LtiNonceError.name === 'LtiNonceError').toBe(true)
  })

  test('should export Error instances', () => {
    expect(new LtiSignatureError() instanceof Error).toBe(true)
    expect(new LtiSignatureError() instanceof LtiSignatureError).toBe(true)
    expect(new LtiNonceError() instanceof Error).toBe(true)
    expect(new LtiNonceError() instanceof LtiNonceError).toBe(true)
  })
})
