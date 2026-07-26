# WhatsApp Cloud API integration

JuaBei's Channels application exposes a Meta WhatsApp Cloud API webhook at
`/webhooks/whatsapp`. The webhook verifies Meta's subscription request, accepts
incoming text messages, keeps short-lived conversation state, requests a crop
valuation from the API Gateway, and replies through the WhatsApp Cloud API.

## Prerequisites

- A Meta developer app with the **Connect on WhatsApp** use case.
- A WhatsApp Business Account and either Meta's test number or a registered
  business number.
- An HTTPS URL that forwards to the Channels application on port `3000`.
- Node.js dependencies installed in `channels`, `services`, and `ai-data`.

For local development, an ngrok authtoken is also required. Obtain one from the
[ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).

## 1. Configure the environment

Add the following server-side variables to the root `.env` file:

```dotenv
API_GATEWAY_URL=http://localhost:4000
WHATSAPP_VERIFY_TOKEN=choose-a-private-verification-token
WHATSAPP_APP_SECRET=your-meta-app-secret
WHATSAPP_CLOUD_API_TOKEN=your-cloud-api-access-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_GRAPH_API_BASE_URL=https://graph.facebook.com/vXX.X
NGROK_AUTHTOKEN=your-ngrok-authtoken
```

Keep every variable on its own line. Use a currently supported Graph API
version shown in the Meta dashboard.

The verification token is a private value chosen by the project team. It is not
the Meta App Secret or Cloud API access token. The value entered in Meta must
exactly match `WHATSAPP_VERIFY_TOKEN`.

Do not commit `.env` or copy credentials into documentation, screenshots, issue
comments, or chat messages. Rotate any credential that has been disclosed.

## 2. Start the local services and HTTPS tunnel

From the repository root, start AI/Data in one terminal:

```bash
npm run dev:ai-data
```

In a second terminal, run:

```bash
npm run dev:ussd
```

The second command starts the API Gateway on port `4000`, Channels on port
`3000`, and an ngrok tunnel to Channels. Although the helper is named
`dev:ussd`, the HTTPS tunnel also serves the WhatsApp webhook.

Copy the HTTPS URL printed by ngrok and append `/webhooks/whatsapp`:

```text
https://YOUR-NGROK-HOST/webhooks/whatsapp
```

Keep both terminals running. A free ngrok hostname can change after a restart,
so the Meta callback must be updated when it changes.

## 3. Configure the Meta webhook

In the [Meta developer dashboard](https://developers.facebook.com/apps/):

1. Open the JuaBei app.
2. Select **Use cases** and then **Connect on WhatsApp**.
3. Open **Step 2: Production setup**.
4. Find the webhook configuration and choose **Configure** or **Edit**.
5. Enter the complete ngrok URL as the **Callback URL**.
6. Enter the value of `WHATSAPP_VERIFY_TOKEN` as the **Verify token**.
7. Select **Verify and save**.
8. Open **Manage webhook fields** and subscribe to the `messages` field.

Successful verification only confirms that Meta can reach the GET handler.
Incoming messages will not be delivered until the `messages` field is
subscribed.

## 4. Configure a phone number

### Fastest demo: Meta test number

1. Open **Step 1: Try it out** in the WhatsApp use case.
2. Add the presenter's personal WhatsApp number as an approved recipient.
3. Complete the recipient verification.
4. Copy Meta's temporary access token into
   `WHATSAPP_CLOUD_API_TOKEN`.
5. Copy the displayed Phone Number ID into
   `WHATSAPP_PHONE_NUMBER_ID`.
6. Restart the local services after changing `.env`.

Temporary Meta access tokens expire. Generate a new token when Meta reports an
authentication error.

### Production business number

1. Open **Phone numbers** or select **Manage** beside **Phone Number**.
2. Complete the business name, public website or social profile, country, and
   WhatsApp Business Profile.
3. Add a number that can receive an SMS or voice verification call.
4. Verify the number and update `WHATSAPP_PHONE_NUMBER_ID`.
5. Replace the temporary token with an appropriate long-lived system-user
   access token before production.

A number already used by the WhatsApp or WhatsApp Business mobile application
may require Meta's supported coexistence or migration process.

## 5. Test the conversation

Using the approved recipient, send this text to the configured WhatsApp number:

```text
START
```

The expected conversation is:

1. JuaBei asks the user to select a crop.
2. The user enters the crop number.
3. JuaBei asks for quantity in kilograms.
4. The user enters a positive quantity.
5. JuaBei asks for the county.
6. The API Gateway returns a valuation range.
7. The user can enter a broker's price for comparison or `0` to finish.

The commands `START`, `MENU`, `HELLO`, `HI`, and `PRICE` restart the flow.
Conversation state expires after 30 minutes and is currently held in memory,
which is suitable for the demo but must be replaced with shared expiring
storage for a multi-instance production deployment.

## Troubleshooting

| Symptom                                           | Likely cause and action                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Meta cannot verify the callback                   | Confirm Channels and ngrok are running, use the current HTTPS hostname, and make the verify tokens identical. |
| Verification succeeds but no messages arrive      | Subscribe the webhook to the `messages` field and confirm the message was sent to the configured number.      |
| The webhook returns `401 Invalid signature`       | Confirm `WHATSAPP_APP_SECRET` belongs to the same Meta app.                                                   |
| An incoming message arrives but no reply is sent  | Check the Cloud API token, Phone Number ID, Graph API base URL, and terminal error output.                    |
| Meta returns an OAuth or token error              | Generate a fresh test token or configure a valid production system-user token.                                |
| JuaBei says market prices are being prepared      | The API Gateway did not return a usable valuation; check Gateway and AI/Data health and data availability.    |
| Only one personal number can test the integration | The app is using Meta's test number; add each recipient in **Try it out** or register a production number.    |

For the API concepts and current platform requirements, refer to Meta's
[WhatsApp Cloud API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/).
