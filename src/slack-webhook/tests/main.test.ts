import { APIGatewayProxyEvent } from 'aws-lambda'
import { sendWebhookEvent } from '../lib/main'

const ApiGwRequest: APIGatewayProxyEvent = {
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  body: '{"sample":"event"}',
  path: '',
  pathParameters: {},
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  stageVariables: {},
  requestContext: {
    accountId: 'accountId',
    apiId: 'apiId',
    authorizer: {},
    httpMethod: 'httpMethod',
    path: 'path',
    protocol: 'protocol',
    requestId: 'requestId',
    requestTimeEpoch: 123,
    resourceId: 'resourceId',
    resourcePath: 'resourcePath',
    stage: 'stage',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      userArn: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
    },
  },
  resource: '',
}

describe('Send webhook event', () => {
  describe('unit', () => {
    it('should invoke notification.send', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const result = await sendWebhookEvent(ApiGwRequest, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwRequest)
    })

    it('should pass text if a request Content-Type is not application/json', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const result = await sendWebhookEvent(ApiGwRequest, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwRequest)
    })

    it('should parse JSON body if a request Content-Type is application/json', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) })
      const ApiGwJsonResponse = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/json' }, body: { test: true } })
      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJsonResponse)
    })

    it('should parse JSON body if a request Content-Type is application/json with charset', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ test: true }) })
      const ApiGwJsonResponse = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: { test: true } })
      await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJsonResponse)
    })

    it('should fall back to the original body if parsing JSON fails', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: 'not a JSON' })
      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJson)
    })

    it('should parse JSON body if a request Content-Type is application/x-www-form-urlencoded', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'token=gIkuvaNzQIHg97ATvDxqgjtO&team_id=T0001&team_domain=example&enterprise_id=E0001&enterprise_name=Globular%20Construct%20Inc&channel_id=C2147483705&channel_name=test&user_id=U2147483697&user_name=Steve&command=/weather&text=94070&response_url=https://hooks.slack.com/commands/1234/5678&trigger_id=13345224609.738474920.8088930838d88f008e0' })
      const ApiGwJsonResponse = Object.assign({}, ApiGwRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: {
          token: 'gIkuvaNzQIHg97ATvDxqgjtO',
          team_id: 'T0001',
          team_domain: 'example',
          enterprise_id: 'E0001',
          enterprise_name: 'Globular Construct Inc',
          channel_id: 'C2147483705',
          channel_name: 'test',
          user_id: 'U2147483697',
          user_name: 'Steve',
          command: '/weather',
          text: '94070',
          response_url: 'https://hooks.slack.com/commands/1234/5678',
          trigger_id: '13345224609.738474920.8088930838d88f008e0',
        },
      })
      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJsonResponse)
    })

    it('should parse JSON body if a request Content-Type is application/x-www-form-urlencoded with charset', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' }, body: 'token=gIkuvaNzQIHg97ATvDxqgjtO&team_id=T0001&team_domain=example&enterprise_id=E0001&enterprise_name=Globular%20Construct%20Inc&channel_id=C2147483705&channel_name=test&user_id=U2147483697&user_name=Steve&command=/weather&text=94070&response_url=https://hooks.slack.com/commands/1234/5678&trigger_id=13345224609.738474920.8088930838d88f008e0' })
      const ApiGwJsonResponse = Object.assign({}, ApiGwRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: {
          token: 'gIkuvaNzQIHg97ATvDxqgjtO',
          team_id: 'T0001',
          team_domain: 'example',
          enterprise_id: 'E0001',
          enterprise_name: 'Globular Construct Inc',
          channel_id: 'C2147483705',
          channel_name: 'test',
          user_id: 'U2147483697',
          user_name: 'Steve',
          command: '/weather',
          text: '94070',
          response_url: 'https://hooks.slack.com/commands/1234/5678',
          trigger_id: '13345224609.738474920.8088930838d88f008e0',
        },
      })
      await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJsonResponse)
    })

    it('should fall back to the original body if parsing querystring fails', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: '',
      })
      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJson)
    })

    it('should decode base64 encoded body before parsing', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'dG9rZW49Z0lrdXZhTnpRSUhnOTdBVHZEeHFnanRPJnRlYW1faWQ9VDAwMDEmdGVhbV9kb21haW49ZXhhbXBsZSZlbnRlcnByaXNlX2lkPUUwMDAxJmVudGVycHJpc2VfbmFtZT1HbG9idWxhciUyMENvbnN0cnVjdCUyMEluYyZjaGFubmVsX2lkPUMyMTQ3NDgzNzA1JmNoYW5uZWxfbmFtZT10ZXN0JnVzZXJfaWQ9VTIxNDc0ODM2OTcmdXNlcl9uYW1lPVN0ZXZlJmNvbW1hbmQ9L3dlYXRoZXImdGV4dD05NDA3MCZyZXNwb25zZV91cmw9aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vY29tbWFuZHMvMTIzNC81Njc4JnRyaWdnZXJfaWQ9MTMzNDUyMjQ2MDkuNzM4NDc0OTIwLjgwODg5MzA4MzhkODhmMDA4ZTA', isBase64Encoded: true })
      const ApiGwJsonResponse = Object.assign({}, ApiGwRequest, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: {
          token: 'gIkuvaNzQIHg97ATvDxqgjtO',
          team_id: 'T0001',
          team_domain: 'example',
          enterprise_id: 'E0001',
          enterprise_name: 'Globular Construct Inc',
          channel_id: 'C2147483705',
          channel_name: 'test',
          user_id: 'U2147483697',
          user_name: 'Steve',
          command: '/weather',
          text: '94070',
          response_url: 'https://hooks.slack.com/commands/1234/5678',
          trigger_id: '13345224609.738474920.8088930838d88f008e0',
        },
        isBase64Encoded: true,
      })
      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith(ApiGwJsonResponse)
    })

    it('should return challenge if request type is url_verification',  async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = Object.assign({}, ApiGwRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'Jhj5dZrVaK7ZwHHjRyZWjbDl',
          challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P',
          type: 'url_verification',
        }),
      })

      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBe('3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P')
      expect(notificationMock.send).not.toHaveBeenCalled()
    })

    it('should parse Slack action event', async () => {
      const notificationMock = {
        send: jest.fn(),
      }
      const ApiGwJson = {
        version: 1,
        resource: '/',
        path: '/',
        httpMethod: 'POST',
        headers: {
          'Content-Length': '2552',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: 'a12b3cd4ef.execute-api.us-east-1.amazonaws.com',
          'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
          'X-Amzn-Trace-Id': 'Root=1-2bcd3456-b9c74d1681859b4e2a6969db',
          'X-Forwarded-For': '1.2.3.4',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https',
          'X-Slack-Request-Timestamp': '1583309715',
          'X-Slack-Signature':
            'v0=12a345678b3819c4986cadaa83e9d2a9afb014ff7d6784634dc11456141cfc6',
          accept: 'application/json,*/*',
          'accept-encoding': 'gzip,deflate',
        },
        multiValueHeaders: {
          'Content-Length': ['2552'],
          'Content-Type': ['application/x-www-form-urlencoded'],
          Host: ['a12b3cd4ef.execute-api.us-east-1.amazonaws.com'],
          'User-Agent': ['Slackbot 1.0 (+https://api.slack.com/robots)'],
          'X-Amzn-Trace-Id': ['Root=1-2bcd3456-b9c74d1681859b4e2a6969db'],
          'X-Forwarded-For': ['1.2.3.4'],
          'X-Forwarded-Port': ['443'],
          'X-Forwarded-Proto': ['https'],
          'X-Slack-Request-Timestamp': ['1583309715'],
          'X-Slack-Signature': [
            'v0=12a345678b3819c4986cadaa83e9d2a9afb014ff7d6784634dc11456141cfc6',
          ],
          accept: ['application/json,*/*'],
          'accept-encoding': ['gzip,deflate'],
        },
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'a12b3cd4ef',
          authorizer: {
            claims: null,
            scopes: null,
          },
          domainName: 'a12b3cd4ef.execute-api.us-east-1.amazonaws.com',
          domainPrefix: 'a12b3cd4ef',
          extendedRequestId: 'I2x_DgBeoAMEMFA=',
          httpMethod: 'POST',
          identity: {
            apiKey: null,
            apiKeyId: null,
            accessKey: null,
            accountId: null,
            caller: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: '1.2.3.4',
            user: null,
            userAgent: 'Slackbot 1.0 (+https://api.slack.com/robots)',
            userArn: null,
          },
          path: '/',
          protocol: 'HTTP/1.1',
          requestId: 'I2x_DgBeoAMEMFA=',
          requestTime: '04/Mar/2020:08:15:15 +0000',
          requestTimeEpoch: 1583309715467,
          resourceId: '',
          resourcePath: '/',
          stage: '$default',
        },
        pathParameters: null,
        stageVariables: null,
        body: 'cGF5bG9hZD0lN0IlMjJ0eXBlJTIyJTNBJTIyYmxvY2tfYWN0aW9ucyUyMiUyQyUyMnRlYW0lMjIlM0ElN0IlMjJpZCUyMiUzQSUyMlQxQUJDMjM0RCUyMiUyQyUyMmRvbWFpbiUyMiUzQSUyMnZ0LXJvY2tzJTIyJTdEJTJDJTIydXNlciUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyVTFBQkNEMjNFJTIyJTJDJTIydXNlcm5hbWUlMjIlM0ElMjJzbG9ib2RhbiUyMiUyQyUyMm5hbWUlMjIlM0ElMjJzbG9ib2RhbiUyMiUyQyUyMnRlYW1faWQlMjIlM0ElMjJUMUFCQzIzNEQlMjIlN0QlMkMlMjJhcGlfYXBwX2lkJTIyJTNBJTIyQUNVRUYxNzVLJTIyJTJDJTIydG9rZW4lMjIlM0ElMjJUVXJzaGlqYVQxS2hqbUJyN1NISGVJSVglMjIlMkMlMjJjb250YWluZXIlMjIlM0ElN0IlMjJ0eXBlJTIyJTNBJTIydmlldyUyMiUyQyUyMnZpZXdfaWQlMjIlM0ElMjJWVVdROTRYTFAlMjIlN0QlMkMlMjJ0cmlnZ2VyX2lkJTIyJTNBJTIyOTgzMTIxMzA5Nzk5LjI5NjgzNDI3MjE5Ny44ZWYyN2IwZjc0MzM3ZTI2Mjc5NThiYmQ2NGI4ZTM5OCUyMiUyQyUyMnZpZXclMjIlM0ElN0IlMjJpZCUyMiUzQSUyMlZVV1E5NFhMUCUyMiUyQyUyMnRlYW1faWQlMjIlM0ElMjJUMUFCQzIzNEQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyaG9tZSUyMiUyQyUyMmJsb2NrcyUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJzZWN0aW9uJTIyJTJDJTIyYmxvY2tfaWQlMjIlM0ElMjJyeVElMjIlMkMlMjJ0ZXh0JTIyJTNBJTdCJTIydHlwZSUyMiUzQSUyMm1ya2R3biUyMiUyQyUyMnRleHQlMjIlM0ElMjJIZXklMjElMjIlMkMlMjJ2ZXJiYXRpbSUyMiUzQWZhbHNlJTdEJTJDJTIyYWNjZXNzb3J5JTIyJTNBJTdCJTIydHlwZSUyMiUzQSUyMmJ1dHRvbiUyMiUyQyUyMnRleHQlMjIlM0ElN0IlMjJ0eXBlJTIyJTNBJTIycGxhaW5fdGV4dCUyMiUyQyUyMnRleHQlMjIlM0ElMjJDbGljayttZSUyMSUyMiUyQyUyMmVtb2ppJTIyJTNBdHJ1ZSU3RCUyQyUyMnZhbHVlJTIyJTNBJTIyY2xpY2tfbWVfMTIzJTIyJTJDJTIyYWN0aW9uX2lkJTIyJTNBJTIyY2phJTIyJTdEJTdEJTVEJTJDJTIycHJpdmF0ZV9tZXRhZGF0YSUyMiUzQSUyMiUyMiUyQyUyMmNhbGxiYWNrX2lkJTIyJTNBJTIyJTIyJTJDJTIyc3RhdGUlMjIlM0ElN0IlMjJ2YWx1ZXMlMjIlM0ElN0IlN0QlN0QlMkMlMjJoYXNoJTIyJTNBJTIyMTU4MzMxOTMyMC4zN2M4ZGJjMSUyMiUyQyUyMnRpdGxlJTIyJTNBJTdCJTIydHlwZSUyMiUzQSUyMnBsYWluX3RleHQlMjIlMkMlMjJ0ZXh0JTIyJTNBJTIyVmlldytUaXRsZSUyMiUyQyUyMmVtb2ppJTIyJTNBdHJ1ZSU3RCUyQyUyMmNsZWFyX29uX2Nsb3NlJTIyJTNBZmFsc2UlMkMlMjJub3RpZnlfb25fY2xvc2UlMjIlM0FmYWxzZSUyQyUyMmNsb3NlJTIyJTNBbnVsbCUyQyUyMnN1Ym1pdCUyMiUzQW51bGwlMkMlMjJwcmV2aW91c192aWV3X2lkJTIyJTNBbnVsbCUyQyUyMnJvb3Rfdmlld19pZCUyMiUzQSUyMlZVV1E5NFhMUCUyMiUyQyUyMmFwcF9pZCUyMiUzQSUyMkFDVUVGMTc1SyUyMiUyQyUyMmV4dGVybmFsX2lkJTIyJTNBJTIyJTIyJTJDJTIyYXBwX2luc3RhbGxlZF90ZWFtX2lkJTIyJTNBJTIyVDFBQkMyMzREJTIyJTJDJTIyYm90X2lkJTIyJTNBJTIyQjEyMzQ1Njc4JTIyJTdEJTJDJTIyYWN0aW9ucyUyMiUzQSU1QiU3QiUyMmFjdGlvbl9pZCUyMiUzQSUyMmNqYSUyMiUyQyUyMmJsb2NrX2lkJTIyJTNBJTIycnlRJTIyJTJDJTIydGV4dCUyMiUzQSU3QiUyMnR5cGUlMjIlM0ElMjJwbGFpbl90ZXh0JTIyJTJDJTIydGV4dCUyMiUzQSUyMkNsaWNrK21lJTIxJTIyJTJDJTIyZW1vamklMjIlM0F0cnVlJTdEJTJDJTIydmFsdWUlMjIlM0ElMjJjbGlja19tZV8xMjMlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyYnV0dG9uJTIyJTJDJTIyYWN0aW9uX3RzJTIyJTNBJTIyMTU4MzMxOTMyMy4wMzg5NDclMjIlN0QlNUQlN0Q',
        isBase64Encoded: true,
      }

      const result = await sendWebhookEvent(ApiGwJson, notificationMock)
      expect(result).toBeNull()
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith({
        body: {
          payload: {
            type: 'block_actions',
            actions: [
              {
                action_id: 'cja',
                action_ts: '1583319323.038947',
                block_id: 'ryQ',
                text: {
                  emoji: true,
                  text: 'Click me!',
                  type: 'plain_text',
                },
                type: 'button',
                value: 'click_me_123',
              },
            ],
            api_app_id: 'ACUEF175K',
            container: {
              type: 'view',
              view_id: 'VUWQ94XLP',
            },
            team: {
              domain: 'vt-rocks',
              id: 'T1ABC234D',
            },
            token: 'TUrshijaT1KhjmBr7SHHeIIX',
            trigger_id: '983121309799.296834272197.8ef27b0f74337e2627958bbd64b8e398',
            user: {
              id: 'U1ABCD23E',
              name: 'slobodan',
              team_id: 'T1ABC234D',
              username: 'slobodan',
            },
            view: {
              app_id: 'ACUEF175K',
              app_installed_team_id: 'T1ABC234D',
              blocks: [
                {
                  accessory: {
                    action_id: 'cja',
                    text: {
                      emoji: true,
                      text: 'Click me!',
                      type: 'plain_text',
                    },
                    type: 'button',
                    value: 'click_me_123',
                  },
                  block_id: 'ryQ',
                  text: {
                    text: 'Hey!',
                    type: 'mrkdwn',
                    verbatim: false,
                  },
                  type: 'section',
                },
              ],
              bot_id: 'B12345678',
              callback_id: '',
              clear_on_close: false,
              close: null,
              external_id: '',
              hash: '1583319320.37c8dbc1',
              id: 'VUWQ94XLP',
              notify_on_close: false,
              previous_view_id: null,
              private_metadata: '',
              root_view_id: 'VUWQ94XLP',
              state: {
                values: {},
              },
              submit: null,
              team_id: 'T1ABC234D',
              title: {
                emoji: true,
                text: 'View Title',
                type: 'plain_text',
              },
              type: 'home',
            },
          },
        },
        headers: {
          'Content-Length': '2552',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: 'a12b3cd4ef.execute-api.us-east-1.amazonaws.com',
          'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
          'X-Amzn-Trace-Id': 'Root=1-2bcd3456-b9c74d1681859b4e2a6969db',
          'X-Forwarded-For': '1.2.3.4',
          'X-Forwarded-Port': '443',
          'X-Forwarded-Proto': 'https',
          'X-Slack-Request-Timestamp': '1583309715',
          'X-Slack-Signature':
            'v0=12a345678b3819c4986cadaa83e9d2a9afb014ff7d6784634dc11456141cfc6',
          accept: 'application/json,*/*',
          'accept-encoding': 'gzip,deflate',
        },
        multiValueHeaders: {
          'Content-Length': ['2552'],
          'Content-Type': ['application/x-www-form-urlencoded'],
          Host: ['a12b3cd4ef.execute-api.us-east-1.amazonaws.com'],
          'User-Agent': ['Slackbot 1.0 (+https://api.slack.com/robots)'],
          'X-Amzn-Trace-Id': ['Root=1-2bcd3456-b9c74d1681859b4e2a6969db'],
          'X-Forwarded-For': ['1.2.3.4'],
          'X-Forwarded-Port': ['443'],
          'X-Forwarded-Proto': ['https'],
          'X-Slack-Request-Timestamp': ['1583309715'],
          'X-Slack-Signature': [
            'v0=12a345678b3819c4986cadaa83e9d2a9afb014ff7d6784634dc11456141cfc6',
          ],
          accept: ['application/json,*/*'],
          'accept-encoding': ['gzip,deflate'],
        },
        httpMethod: 'POST',
        isBase64Encoded: true,
        multiValueQueryStringParameters: null,
        path: '/',
        pathParameters: null,
        queryStringParameters: null,
        requestContext: {
          accountId: '123456789012',
          apiId: 'a12b3cd4ef',
          authorizer: {
            claims: null,
            scopes: null,
          },
          domainName: 'a12b3cd4ef.execute-api.us-east-1.amazonaws.com',
          domainPrefix: 'a12b3cd4ef',
          extendedRequestId: 'I2x_DgBeoAMEMFA=',
          httpMethod: 'POST',
          identity: {
            apiKey: null,
            apiKeyId: null,
            accessKey: null,
            accountId: null,
            caller: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: '1.2.3.4',
            user: null,
            userAgent: 'Slackbot 1.0 (+https://api.slack.com/robots)',
            userArn: null,
          },
          path: '/',
          protocol: 'HTTP/1.1',
          requestId: 'I2x_DgBeoAMEMFA=',
          requestTime: '04/Mar/2020:08:15:15 +0000',
          requestTimeEpoch: 1583309715467,
          resourceId: '',
          resourcePath: '/',
          stage: '$default',
        },
        resource: '/',
        stageVariables: null,
        version: 1,
      })
    })
  })
})
