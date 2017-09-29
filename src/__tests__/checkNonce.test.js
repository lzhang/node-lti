const checkNonceFromMemory = require('../checkNonce')
const { LtiNonceError } = require('../errors')

Date.now = jest.fn(() => 1506722797000)

describe('checkNonceFromMemory', () => {
  test('should return true on valid nonce', () => {
    expect(checkNonceFromMemory('key', 'nonce1', Date.now() / 1000)).toBe(true)
  })

  test('should return true on second valid nonce', () => {
    expect(checkNonceFromMemory('key', 'nonce2', Date.now() / 1000)).toBe(true)
  })

  test('should return true on duplicate nonce value for different keys', () => {
    expect(checkNonceFromMemory('key2', 'nonce2', Date.now() / 1000)).toBe(true)
  })

  test('should throw on duplicate nonce', () => {
    expect(() => {
      checkNonceFromMemory('key', 'nonce1', Date.now() / 1000)
    }).toThrow(LtiNonceError)
  })

  test('should throw on expired nonce', () => {
    expect(() => {
      checkNonceFromMemory('key', 'nonce1', Date.now() / 1000 - 601)
    }).toThrow(LtiNonceError)
  })

  test('should throw on nonce from the future', () => {
    expect(() => {
      checkNonceFromMemory('key', 'nonce1', Date.now() / 1000 + 1)
    }).toThrow(LtiNonceError)
  })

  test('should allow the same nonce after the expiration period', () => {
    expect(checkNonceFromMemory('key', 'nonce3', Date.now() / 1000)).toBe(true)
    Date.now.mockReturnValueOnce(1506723398000)
    expect(checkNonceFromMemory('key', 'nonce3', 1506723398)).toBe(true)
  })

  test('should throw on missing parameters', () => {
    expect(() => {
      checkNonceFromMemory()
    }).toThrow(TypeError)

    expect(() => {
      checkNonceFromMemory('key')
    }).toThrow(TypeError)

    expect(() => {
      checkNonceFromMemory('key', 'nonce')
    }).toThrow(TypeError)

    expect(() => {
      checkNonceFromMemory(null, 'nonce')
    }).toThrow(TypeError)

    expect(() => {
      checkNonceFromMemory(null, null, 1506722797)
    }).toThrow(TypeError)
  })
})
