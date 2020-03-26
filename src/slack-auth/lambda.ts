// Allow CloudWatch to read source maps
import 'source-map-support/register'

import { APIGatewayProxyResult } from 'aws-lambda'
import { EventBridgeRepository } from '../common/event-bridge-repository'
import { slackAuth } from './lib/main'
import { parseApiEvent } from './lib/parse-api-event'
import { IHttpApiEvent } from '../common/types/http-api-event'
import rp from 'minimal-request-promise'

export async function handler(event: IHttpApiEvent): Promise<APIGatewayProxyResult> {
  try {
    console.log('event: ', JSON.stringify(event))

    const eventBusName = process.env.EVENT_BUS_NAME
    const eventSource = process.env.EVENT_SOURCE
    const slackClientId = process.env.SLACK_CLIENT_ID
    const slackClientSecret = process.env.SLACK_CLIENT_SECRET
    const slackRedirectUrl = process.env.SLACK_REDIRECT_URL

    if (!eventBusName) {
      throw new Error('Webhook URL is required as "process.env.EVENT_BUS_NAME"')
    }

    if (!eventSource) {
      throw new Error('Event source is required as "process.env.EVENT_SOURCE"')
    }

    if (!slackClientId) {
      throw new Error('Slack Client Id is required as "process.env.SLACK_CLIENT_ID"')
    }

    if (!slackClientSecret) {
      throw new Error('Slack Client Secret is required as "process.env.SLACK_CLIENT_SECRET"')
    }

    if (!slackRedirectUrl) {
      throw new Error('Slack Redirect URL is required as "process.env.SLACK_REDIRECT_URL"')
    }

    const code = parseApiEvent(event)

    const eventBridgeNotificationRepository = new EventBridgeRepository(eventBusName, eventSource)
    const redirectUrl = await slackAuth(slackClientId, slackClientSecret, code, slackRedirectUrl, rp, eventBridgeNotificationRepository)

    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
      },
      body: '',
    }
  } catch(err) {
    return {
      statusCode: 400,
      body: err.toString(),
    }
  }
}
