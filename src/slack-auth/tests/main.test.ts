import { slackAuth } from '../lib/main'

describe('slackAuth', () => {
  describe('unit', () => {
    test('should send an HTTP request', async () => {
      const httpLibMock = {
        post: jest.fn().mockResolvedValue({ body: '{}' }),
      }

      const notificationMock = {
        send: jest.fn(),
      }

      await slackAuth('clientId', 'clientSecret', 'code', 'redirectUrl', httpLibMock, notificationMock)

      expect(httpLibMock.post).toHaveBeenCalledTimes(1)
      expect(httpLibMock.post).toHaveBeenCalledWith('https://slack.com/api/oauth.access', {
        body: 'client_id=clientId&client_secret=clientSecret&code=code&redirect_uri=redirectUrl',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    })

    test('should send a message to an event bus', async () => {
      const httpLibMock = {
        post: jest.fn().mockResolvedValue({ body: '{}' }),
      }

      const notificationMock = {
        send: jest.fn(),
      }

      await slackAuth('clientId', 'clientSecret', 'code', 'redirectUrl', httpLibMock, notificationMock)

      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith({
        type: 'slack-auth',
        payload: {},
      })
    })

    test('should send an HTTP request, and then send message to an event bus', async () => {
      const httpLibMock = {
        post: jest.fn().mockResolvedValue({
          body: JSON.stringify({
            'access_token': 'xoxp-23984754863-2348975623103',
            scope: 'read',
          }),
        }),
      }

      const notificationMock = {
        send: jest.fn(),
      }

      await slackAuth('clientId', 'clientSecret', 'code', 'redirectUrl', httpLibMock, notificationMock)

      expect(httpLibMock.post).toHaveBeenCalledTimes(1)
      expect(httpLibMock.post).toHaveBeenCalledWith('https://slack.com/api/oauth.access', {
        body: 'client_id=clientId&client_secret=clientSecret&code=code&redirect_uri=redirectUrl',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      expect(notificationMock.send).toHaveBeenCalledTimes(1)
      expect(notificationMock.send).toHaveBeenCalledWith({
        type: 'slack-auth',
        payload: {
          'access_token': 'xoxp-23984754863-2348975623103',
          scope: 'read',
        },
      })
    })
  })
})