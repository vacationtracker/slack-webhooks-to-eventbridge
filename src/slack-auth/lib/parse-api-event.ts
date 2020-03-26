import { IHttpApiEvent } from '../../common/types/http-api-event'

export function parseApiEvent(event: IHttpApiEvent): string {
  if (!event.queryStringParameters || !event.queryStringParameters.code) {
    throw new Error('Code is required in query string parameters')
  }

  return event.queryStringParameters.code
}