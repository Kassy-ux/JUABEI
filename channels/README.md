# Channels

The Channels lane contains JuaBei's farmer-facing PWA and the inbound USSD and
WhatsApp webhooks. All pricing work is delegated to the API Gateway.

## Run locally

Install dependencies inside this folder, then provide the server-side
configuration in your shell:

```bash
npm install
API_GATEWAY_URL=http://localhost:4000 npm run dev
```

The PWA is served at `http://localhost:3000`.

## Routes

| Route                    | Purpose                                                      |
| ------------------------ | ------------------------------------------------------------ |
| `/`                      | Farmer valuation, broker comparison, and visual export check |
| `/api/valuation`         | Same-origin server proxy to the Gateway valuation endpoint   |
| `/api/export-assessment` | Same-origin server proxy to the Gateway export endpoint      |
| `/webhooks/ussd`         | Africa's Talking USSD callback                               |
| `/webhooks/whatsapp`     | Meta webhook verification and inbound WhatsApp messages      |

### USSD

Configure Africa's Talking to POST to:

```text
https://YOUR_CHANNELS_HOST/webhooks/ussd
```

The route accepts the standard `sessionId`, `serviceCode`, `phoneNumber`, and
`text` form fields. It returns Africa's Talking `CON` and `END` plain-text
responses.

### WhatsApp

Configure the Meta webhook callback as:

```text
https://YOUR_CHANNELS_HOST/webhooks/whatsapp
```

Set `WHATSAPP_VERIFY_TOKEN` to the same value entered in the Meta dashboard.
Set `WHATSAPP_APP_SECRET` so production requests can be checked against the
`x-hub-signature-256` header. Immediate conversational replies use the Cloud API
credentials and base URL documented in the root `.env.example`.

Conversation state is currently held in memory for the demo. A multi-instance
or serverless production deployment must replace the maps with shared,
expiring storage.

## Verification

```bash
npm run format
npm run lint
npm run check
npm run build
```
