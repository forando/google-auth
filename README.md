## Google Auth Token Manager

Enables a token owner to keep it separately for use in services that require it.

## Overview

If you want to share your Google Photos or Youtube Library outside of those apps you have to share your Google Account credentials. This is not safe and not recommended. This app allows you to keep your Google Auth Token separately and use it in other apps that require it.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Integration with API Gateway.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Architecture
![Google Auth Token Manager](google_auth.jpg "Google Auth Token Manager")

## Sandbox Environment
In order to successfully deploy the solution to a sandbox you must provide APP_ID secret with `npx ampx sandbox secret set APP_ID`.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the MIT-0 License. See the LICENSE file.