const checkNonce = require('../checkNonce')
const validLti = require('../')
const { LtiNonceError, LtiSignatureError } = require('../errors')
const { merge, omit } = require('ramda')
const mockBody = require('./mockBody.json')
const mockUrl = 'http://localhost:3000/'

jest.mock('../checkNonce')

describe('validLti', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => (Number(mockBody.oauth_timestamp) + 1) * 1000)
  })

  test('should throw on missing secret', () => {
    expect(() => {
      validLti()
    }).toThrow(TypeError)
  })

  test('should throw on missing body', () => {
    expect(() => {
      validLti('secret')
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', null)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', undefined)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', '')
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', {})
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', [])
    }).toThrow(TypeError)
  })

  test('should throw on missing originalUrl', () => {
    expect(() => {
      validLti('secret', mockBody)
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)

    expect(() => {
      validLti('secret', mockBody, null)
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)

    expect(() => {
      validLti('secret', mockBody, undefined)
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)

    expect(() => {
      validLti('secret', mockBody, '')
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)

    expect(() => {
      validLti('secret', mockBody, {})
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)

    expect(() => {
      validLti('secret', mockBody, [])
    }).toThrow(/(Invalid URL|Parameter "url" must be a string)/)
  })

  test('should throw if checkNonce is not a function', () => {
    expect(() => {
      validLti('secret', mockBody, mockUrl, {})
    }).toThrow(TypeError)
  })

  test('should throw on missing oauth parameters', () => {
    debugger
    expect(() => {
      validLti('secret', omit(['oauth_consumer_key'], mockBody), mockUrl)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', omit(['oauth_timestamp'], mockBody), mockUrl)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', omit(['oauth_nonce'], mockBody), mockUrl, () => true)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', omit(['oauth_signature_method'], mockBody), mockUrl)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', omit(['oauth_signature'], mockBody), mockUrl)
    }).toThrow(TypeError)

    expect(() => {
      validLti('secret', omit(['oauth_version'], mockBody), mockUrl, () => true)
    }).toThrow(TypeError)

    expect(() => {
      validLti(
        'secret',
        Object.assign({}, mockBody, { oauth_version: '2.0' }),
        mockUrl
      )
    }).toThrow(TypeError)
  })

  test('should return true for a valid LTI launch', () => {
    expect(validLti('secret', mockBody, mockUrl, () => true)).toBe(true)
  })

  test('should call checkNonceFromMemory if checkNonce is falsy', () => {
    expect(validLti('secret', mockBody, mockUrl)).toBe(true)
    expect(checkNonce).toHaveBeenCalled()
    expect(checkNonce).toBeCalledWith(
      mockBody.oauth_consumer_key,
      mockBody.oauth_nonce,
      Number(mockBody.oauth_timestamp)
    )
  })

  test('should call the user provided checkNonce', () => {
    mockCheckNonce = jest.fn(() => true)
    expect(validLti('secret', mockBody, mockUrl, mockCheckNonce)).toBe(true)
    expect(mockCheckNonce).toHaveBeenCalled()
    expect(mockCheckNonce).toBeCalledWith(
      mockBody.oauth_consumer_key,
      mockBody.oauth_nonce,
      Number(mockBody.oauth_timestamp)
    )
  })

  test('should throw when checkNonce returns false', () => {
    checkNonce.mockReturnValueOnce(false)
    expect(() => {
      validLti('secret', mockBody, mockUrl)
    }).toThrow(LtiNonceError)
  })

  test('should throw when checkNonce throws', () => {
    expect(() => {
      validLti('secret', mockBody, mockUrl, () => {
        throw new TypeError()
      })
    }).toThrow(TypeError)
  })

  test('it should throw when oauth_signature is invalid', () => {
    const mockInvalidSignatureBody = merge(mockBody, {
      oauth_signature: 'wrongsignature'
    })
    expect(() => {
      validLti('secret', mockInvalidSignatureBody, mockUrl)
    }).toThrow(LtiSignatureError)
  })
})
