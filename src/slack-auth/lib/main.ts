import qs from 'querystring'

interface INotificationRepository {
  send: (message: Object) => Promise<any>
}

interface IHttpPostRequestOptions {
  body: string
  headers: {
    [key: string]: string
  }
  [key: string]: any
}

interface IHttpPostResponse {
  body: string
  [key: string]: any
}

interface IHttpRequest {
  post(url: string, options: IHttpPostRequestOptions): Promise<IHttpPostResponse>
}

export async function slackAuth(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUrl: string,
  httpLib: IHttpRequest,
  notification: INotificationRepository
): Promise<string> {
  const response = await httpLib.post('https://slack.com/api/oauth.access', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUrl,
    }),
  })

  const message = JSON.parse(response.body)

  await notification.send({
    type: 'slack-auth',
    payload: message,
  })

  return redirectUrl
}