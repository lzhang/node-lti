const buildParams = require('../buildParams')
const mockBody = require('./mockBody.json')
const { omit } = require('ramda')

describe('buildParams', () => {
  test('should return the OAuth params for a provided body object', () => {
    const expectedParams = omit(['oauth_signature'], mockBody)
    expect(buildParams(mockBody)).toEqual(expectedParams)
  })

  test('should return the OAuth params for body and query objects', () => {
    const expectedParams = omit(['oauth_signature'], mockBody)
    expectedParams.foo = 'bar'
    expect(buildParams(mockBody, { foo: 'bar' })).toEqual(expectedParams)
  })

  test('should override body params with query params', () => {
    const expectedParams = omit(['oauth_signature'], mockBody)
    expectedParams.lis_person_name_full = 'James Bond'
    expect(
      buildParams(mockBody, { lis_person_name_full: 'James Bond' })
    ).toEqual(expectedParams)
  })

  test('should ignore query params for canvas and schoology', () => {
    const expectedParams = omit(['oauth_signature'], mockBody)
    expectedParams.tool_consumer_info_product_family_code = 'canvas'
    mockBody.tool_consumer_info_product_family_code = 'canvas'
    expect(buildParams(mockBody, { foo: 'bar' })).toEqual(expectedParams)
    expectedParams.tool_consumer_info_product_family_code = 'schoology'
    mockBody.tool_consumer_info_product_family_code = 'schoology'
    expect(buildParams(mockBody, { foo: 'bar' })).toEqual(expectedParams)
  })
})
