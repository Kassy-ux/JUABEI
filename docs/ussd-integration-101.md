# USSD Integration 101

This guide explains how JuaBei integrates with Africa's Talking USSD, how to
run the complete flow locally through ngrok, and what must change before a
production launch.

## 1. How the integration works

```text
Farmer or sandbox simulator
        |
        | dials the USSD service code
        v
Africa's Talking
        |
        | HTTPS form POST
        v
Channels: /webhooks/ussd
        |
        | JSON valuation request
        v
API Gateway: /valuation
        |
        v
Channels returns plain text beginning with CON or END
```

Africa's Talking calls the JuaBei callback after every user response. The
request includes these URL-encoded form fields:

| Field         | Meaning                                                         |
| ------------- | --------------------------------------------------------------- |
| `sessionId`   | Identifier shared by every request in one USSD session          |
| `serviceCode` | The dialled code, for example `*384*12345#`                     |
| `phoneNumber` | The user's phone number                                         |
| `text`        | All answers entered so far, joined with `*`, for example `1*50` |

The callback must return HTTP 200 with `text/plain` content:

- `CON ...` displays a menu and keeps the session open.
- `END ...` displays a final message and closes the session.

There must be no whitespace before `CON` or `END`.

## 2. JuaBei's demo conversation

The implemented flow is:

1. Choose maize, beans, or tomatoes.
2. Enter the quantity in kilograms.
3. Choose Nakuru, Kiambu, or Uasin Gishu.
4. Receive a demo fair-price range.
5. Enter a broker offer and receive a comparison.

The prices in `services/src/lib/demo-valuation.ts` are deterministic demo
fixtures. They are not live market prices.

## 3. Prerequisites

- Node.js and npm
- Dependencies installed in `channels/` and `services/`
- An ngrok account and authtoken
- An Africa's Talking sandbox account

Copy `.env.example` to the ignored root `.env`, then add the ngrok token:

```dotenv
API_GATEWAY_URL=http://localhost:4000
NGROK_AUTHTOKEN=replace_with_your_ngrok_token
```

Never commit `.env` or paste an authtoken into documentation.

## 4. Start the local callback

From the repository root, run:

```powershell
npm run dev:ussd
```

This command starts:

- the API Gateway on `http://localhost:4000`;
- the Channels application on `http://localhost:3000`; and
- an ngrok HTTPS tunnel to the Channels application.

The terminal prints a callback similar to:

```text
https://example.ngrok-free.dev/webhooks/ussd
```

Keep this terminal open throughout the demo. A free ngrok hostname can change
after a restart, so update Africa's Talking whenever the printed URL changes.

## 5. Test locally before using the provider

Keep the development environment running and open a second PowerShell window:

```powershell
$texts = @("", "1", "1*100", "1*100*1", "1*100*1*45")

foreach ($text in $texts) {
  $response = Invoke-WebRequest `
    -Method Post `
    -Uri "http://localhost:3000/webhooks/ussd" `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
      sessionId   = "manual-test-1"
      serviceCode = "*384*12345#"
      phoneNumber = "+254700000000"
      text        = $text
    }

  $response.Content
}
```

The first response should start with `CON Welcome to JuaBei`. The final
response should start with `END`.

## 6. Configure Africa's Talking Sandbox

1. Open the Africa's Talking sandbox application.
2. Select **USSD > Create Channel** and create a shared sandbox channel.
3. Open **USSD > Service Codes**.
4. On the assigned code, open the actions menu and select **Callback**.
5. Paste the complete ngrok URL, including `/webhooks/ussd`.
6. Save the callback.
7. Select **Launch Simulator**.
8. Register or select a simulated Kenyan phone number.
9. Dial the exact assigned service code, including the final `#`.

For example, complete the JuaBei flow with:

```text
1     Maize
100   Quantity in kilograms
1     Nakuru
45    Broker offer per kilogram
```

Africa's Talking sandbox sessions run in its web simulator, not on a physical
handset.

## 7. Troubleshooting

### `EADDRINUSE` on port 3000 or 4000

Another JuaBei process is already running. Stop its terminal with `Ctrl+C`, or
identify the owner:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,4000 |
  Select-Object LocalPort, OwningProcess
```

Inspect the PID before stopping it:

```powershell
Get-Process -Id <PID>
Stop-Process -Id <PID>
```

### ngrok says the endpoint is already online

An earlier ngrok session is still active for the configured domain. Stop the
earlier `npm run dev:ussd` process before starting another one.

### Africa's Talking reports a network or callback error

Open **USSD > Sessions**, select the failed session, and inspect the HTTP
status and app response.

Common causes:

- `404`: `/webhooks/ussd` is missing from the callback URL.
- `405`: the provider is not reaching the POST handler.
- `500`: the Channels or valuation service failed.
- `CON/END` error: the response is empty or does not begin exactly with one of
  those keywords.
- SSL error: the callback certificate or public tunnel is unavailable.

### The callback works locally but not through ngrok

Test the public URL directly:

```powershell
Invoke-WebRequest `
  -Method Post `
  -Uri "https://YOUR_NGROK_HOST/webhooks/ussd" `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    sessionId   = "public-test-1"
    serviceCode = "*384*12345#"
    phoneNumber = "+254700000000"
    text        = ""
  }
```

Expect HTTP 200 and a response beginning with `CON`.

## 8. Production checklist

The demo architecture is intentionally local and single-instance. Before going
live:

- deploy Channels and the API Gateway to stable HTTPS hosts;
- replace the ngrok URL with the permanent Channels callback URL;
- replace demo prices with validated live market evidence;
- move USSD session state from the in-memory map to shared expiring storage;
- add request monitoring, latency alerts, and structured session-safe logs;
- keep callback processing within the provider's response timeout;
- limit menu length and interaction steps for handset compatibility;
- avoid logging complete phone numbers or other unnecessary personal data;
- configure the live service code's callback and optional event URL separately;
- run failure tests for provider retries, unavailable pricing, and expired
  sessions.

## References

- [Africa's Talking sandbox setup](https://help.africastalking.com/en/articles/1170660-how-do-i-get-started-on-the-africa-s-talking-sandbox)
- [Africa's Talking live callback setup](https://help.africastalking.com/en/articles/9915125-how-do-i-go-live-with-ussd)
- [Africa's Talking callback debugging](https://help.africastalking.com/en/articles/2219978-how-do-i-debug-my-callback-url)
- [Africa's Talking `CON` and `END` responses](https://help.africastalking.com/en/articles/484351-why-am-i-seeing-the-error-messages-response-should-start-with-a-con-or-an-end)
