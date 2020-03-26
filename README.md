# Slack webhooks to EventBridge event bus

This project is a serverless application that receives a Slack webhook events via POST, sends the received data to the EventBridge event bus, and replies back to Slack with the expected response.

The architecture for this app looks like the following diagram:

![](./assets/slack-webhooks-to-eventbridge.png)



This app contains the following components:

1. _An API Gateway HTTP API endpoint_ a new API Gateway HTTP API is cheaper and less powerful than the REST API, but it has everything we need for the common webhook.
2. _Webhooks Lambda Function_ that we use to process the request, send it to the EventBridge event bus, and immediately return the response to the API Gateway and Slack.
3. _Slack Auth Lambda Function_ that handles Slack auth redirects, requests token from Slack, publishes token to the EventBridge event bus, and redirects user to the provided landing page.

## Deploy and use the application

You can deploy this app from Serverless Application Repository (SAR) or manually, using the Serverless Application Model Command Line Interface (SAM CLI).

### Parameters

This application accepts the following two parameters:

- `EventBusName` (required) - a name of your EventBridge event bus
- `LambdaProvisionedConcurrency` (optional) - a number of Lambda function to provision for this webhook (helpful for reducing the latency)
- `LambdaAlias` (optional) - an alias for the Lambda function (default: live)

### Install from SAR

Go to the [Generic webhook to EventBridge](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:721177882564:applications~generic-webhook-to-eventbridge) App on the AWS Serverless App repo, click Deploy and follow the wizard to configure the app.

Or use with AWS SAM by adding the following resource:

```yaml
GenericWebhookToSns:
  Type: AWS::Serverless::Application
  Properties:
    Location:
      ApplicationId: arn:aws:serverlessrepo:us-east-1:721177882564:applications/slack-webhooks-to-eventbridge
      SemanticVersion: 1.1.1
    Parameters:
      EventBusName: Name of your EventBus
```

### Install manually

The SAM CLI is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy your application for the first time, run the following in your shell:

```bash
yarn run build
sam deploy --guided
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts.

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

### SAR outputs and URLs you can use with Slack

The SAR application will output the following:

- `SlackWebhookApiUrl` represents a Slack webhook URL. You can use this URL for Slack slash commands, events, and interactive components.
- `SlackRedirectUrl` represents a Slack auth URL. You can use this URL as Slack redirect URL.
- `SlackWebhookApiId` is the AWS API Gateway HTTP API ID.

### Use with SAM

You can use Generic webhook to SNS topic application in your SAM application by adding it as a nested app in your SAM template.

A minimal template can look similar to the following one:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: A cool SAM Slack app
  
Globals:
  Function:
    Timeout: 10
    Runtime: nodejs12.x

Resources:
  SlackEventBus: 
    Type: AWS::Events::EventBus
    Properties: 
        Name: SlackEventBus

  SlackWebhooks:
    Type: AWS::Serverless::Application
    Properties:
      Location:
        ApplicationId: arn:aws:serverlessrepo:us-east-1:721177882564:applications/slack-webhooks-to-eventbridge
        SemanticVersion: 1.2.0
      Parameters:
        EventBusName: SlackEventBus
            
  SlackAppHomeTabEventFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: build/app-home-tab
      Handler: lambda.handler
      Events:
        OnAppHomeOpened:
          Type: CloudWatchEvent
          Properties:
            EventBusName: SlackEventBus
            Pattern:
              detail:
                body:
                  event:
                    type:
                    - app_home_opened
                    
  SlackAuthEventFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: build/slack-auth
      Handler: lambda.handler
      Events:
        OnSlackAuth:
          Type: CloudWatchEvent
          Properties:
            EventBusName: SlackEventBus
            Pattern:
              detail:
                type:
                - slack-auth

Outputs:
  SlackWebhookUrl:
    Description: "Webhook URL"
    Value: !GetAtt SlackWebhooks.Outputs.SlackWebhookApiUrl
```


This will deploy the Webhook app from SAR and a Lambda function that will be triggered when a webhook receives the "app_home_opened" event.

Important parts of the template:

- `StripeWebhook (AWS::Serverless::Application)` is a resource that deploys a Slack webhooks to EventBridge event bus app from SAR
- `ApplicationId: arn:aws:serverlessrepo:eu-central-1:721177882564:applications/slack-webhooks-to-eventbridge` is a SAR app ARN (see the [Install from SAR](#install-from-sar) section).

In production, you should consider adding a few more things, such as:

- Lambda destinations for handling errors
- Enable monitoring (i.e., Amazon X-Ray)
- Assigning a custom domain/path to your webhook

### Event structure

The event will have the following structure:

```javascript
{
    "version": "0",
    "id": "12345678-1a2b-3c4d-5e6f-123456789abc",
    "detail-type": "Webhook, source: webhook",
    "source": "webhook",
    "account": "123456789012",
    "time": "2019-12-27T19:24:48Z",
    "region": "us-east-1",
    "resources": [],
    "detail": {
      // A valid API Gateway HTTP API event with parsed body if it's a JSON
    }
}
```

For Slack auth, your EventBridge event bus will receive the event with the following structure:

```javascript
{
    "version": "0",
    "id": "12345678-1a2b-3c4d-5e6f-123456789abc",
    "detail-type": "Webhook, source: webhook",
    "source": "webhook",
    "account": "123456789012",
    "time": "2019-12-27T19:24:48Z",
    "region": "us-east-1",
    "resources": [],
    "detail": {
        "type": "slack-auth",
        "payload": {
            // A JSON response from "https://slack.com/api/oauth.access".
            // For example:
            "access_token": "xoxp-XXXXXXXX-XXXXXXXX-XXXXX",
            "scope": "incoming-webhook,commands,bot",
            "team_name": "Team Installing Your Hook",
            "team_id": "XXXXXXXXXX",
            "incoming_webhook": {
                "url": "https://hooks.slack.com/TXXXXX/BXXXXX/XXXXXXXXXX",
                "channel": "#channel-it-will-post-to",
                "configuration_url": "https://teamname.slack.com/services/BXXXXX"
            },
            "bot":{
                "bot_user_id":"UTTTTTTTTTTR",
                "bot_access_token":"xoxb-XXXXXXXXXXXX-TTTTTTTTTTTTTT"
            }
      }
    }
}
```

## Roadmap

- [x] Handle Slack events
- [x] Handle Slack dialogs
- [x] Handle Slack slash commands and message actions
- [x] Handle Slack auth, and redirect to the selected landing page after the request is done
- [ ] Add support for the custom domains
- [ ] Add Slack event validation
- [ ] Create multiple tutorials

## License

MIT, see [LICENSE](./LICENSE).

------

[![Built by Vacation Tracker team](./assets/by-vacation-tracker-team.png)](https://vacationtracker.io?ref=github-os)