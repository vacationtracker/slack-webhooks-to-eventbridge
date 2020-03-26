import { parseApiEvent } from '../lib/parse-api-event'

const baseEvent = {
  version: '2.0',
  routeKey: 'GET /auth',
  rawPath: '/auth',
  rawQueryString: '',
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'content-length': '0',
    host: 'abcd1e2f34.execute-api.us-east-1.amazonaws.com',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    'x-amzn-trace-id': 'Root=1-1a2b3456-78901a2345b67890c1def123',
    'x-forwarded-for': '1.1.1.1',
    'x-forwarded-port': '443',
    'x-forwarded-proto': 'https',
  },
  requestContext: {
    accountId: '123456789000',
    apiId: 'abcd1e2f34',
    domainName: 'abcd1e2f34.execute-api.us-east-1.amazonaws.com',
    domainPrefix: 'abcd1e2f34',
    http: {
      method: 'GET',
      path: '/auth',
      protocol: 'HTTP/1.1',
      sourceIp: '1.1.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    },
    requestId: 'J_IapjxgoAMEPNA=',
    routeKey: 'GET /auth',
    stage: '$default',
    time: '26/Mar/2020:07:05:40 +0000',
    timeEpoch: 1585206340026,
  },
  isBase64Encoded: false,
}

describe('parseApiEvent', () => {
  describe('unit', () => {
    test('should throw error if code does not exists', () => {
      const event = Object.assign({}, baseEvent)
      expect(() => parseApiEvent(event)).toThrowError('Code is required in query string parameters')
    })

    test('should return code when exists', () => {
      const event = Object.assign({
        rawQueryString: 'code=123',
        queryStringParameters: {
          code: '123',
        },
      }, baseEvent)

      expect(parseApiEvent(event)).toBe('123')
    })
  })
})