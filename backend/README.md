# Netflix Portfolio Contact Form Backend

Serverless contact dispatch backend built with AWS SAM, AWS Lambda (Node.js 20 ESM on `arm64`), Amazon API Gateway HTTP API, and Amazon Simple Email Service (SES).

---

## 1. Architecture Overview

```
Browser Form (ContactSection)
       │
       ▼  (POST https://<ApiUrl>)
Amazon API Gateway (HTTP API)
  - CORS allowlist: AllowedOrigins + localhost:5173
  - Rate limiting & burst throttling (5 rps, burst 10)
  - Preflight OPTIONS handling (204)
       │
       ▼
AWS Lambda (Node.js 20 ESM, arm64, 128 MB, 10s timeout)
  - Runtime pre-installed @aws-sdk/client-ses (zero runtime dependencies)
  - Request origin validation (rejects untrusted browser origins with 403)
  - 10 KB payload size limit (rejects oversized bodies with 413)
  - Safe JSON parsing & RFC 5322 validation
  - CRLF injection prevention: rejects `\r` and `\n` in name & email (400)
  - Honeypot field (`website`): returns 200 `{ ok: true }` without dispatching email
  - HTML entity escaping (`&`, `<`, `>`, `"`, `'`) for XSS prevention in email clients
  - Structured minimal JSON logging (never logs message body or email address)
       │
       ▼  (ses:SendEmail with strict IAM identity ARN scope)
Amazon Simple Email Service (SES)
       │
       ▼
Destination Inbox (RecipientEmail)
```

---

## 2. Prerequisites

1. **AWS CLI** installed and configured (`aws configure`) with appropriate deployment permissions.
2. **AWS SAM CLI** installed (`sam --version`).
3. **Verified SES Email Identity**:
   - In the [AWS SES Console](https://console.aws.amazon.com/ses), verify your email address in your target AWS region (e.g., `ap-south-1`):
     - Navigate to **Identities** → **Create identity** → choose **Email address** → enter your email (e.g. `yourname@example.com`).
     - Open the confirmation email and click the verification link.
   - **Single Address Setup**: `SenderEmail` and `RecipientEmail` can be the **exact same verified address** (e.g. `yourname@example.com`). With this setup, **one single SES verification is enough** to both send and receive contact notifications, even within the SES sandbox!

---

## 3. Deployment Steps

From the project root, navigate to the `backend` directory:

```bash
cd backend
```

### Step 3.1: Validate the SAM Template
```bash
sam validate
```

### Step 3.2: Build the Artifacts
```bash
sam build
```

### Step 3.3: Guided Deployment
Run guided deployment for your initial deployment:

```bash
sam deploy --guided
```

When prompted, enter:
- **Stack Name**: `portfolio-contact-backend` (or your preferred name)
- **AWS Region**: `ap-south-1` (or your preferred region)
- **Parameter SenderEmail**: `<SenderEmail>` (e.g. `yourname@example.com` - your verified SES address)
- **Parameter RecipientEmail**: `<RecipientEmail>` (can be the same `<SenderEmail>` address)
- **Parameter AllowedOrigins**: `https://main.<app-id>.amplifyapp.com,http://localhost:5173`
- **Parameter SesRegion**: Leave blank (press Enter) to default to the stack deployment region
- **Confirm changes before deploy**: `y` (or `n`)
- **Allow SAM CLI IAM role creation**: `y` (required for scoped execution role)
- **Disable rollback for deployments**: `n`
- **Save arguments to configuration file**: `y`
- **SAM configuration file [samconfig.toml]**: Press Enter (default)
- **SAM configuration environment [default]**: Press Enter (default)

---

## 4. Obtain the API Endpoint URL

At the end of the deployment output, locate the **Outputs** table:

```text
Key                 ApiUrl
Description         Full HTTPS URL for the contact form API endpoint
Value               https://<api-id>.execute-api.ap-south-1.amazonaws.com/contact
```

Copy the `Value` URL. This is your `ApiUrl`.

---

## 5. Smoke Testing the Deployed Endpoint

Run a test POST request with `curl`:

```bash
curl -i -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Tester","email":"test@example.com","message":"Hello from curl testing"}'
```

Expected response:
```http
HTTP/2 200
content-type: application/json

{"ok":true}
```

Verify that the transmission notification arrives in your destination inbox with both formatted plain text and HTML card views.

---

## 6. Updating Allowed Origins / Parameters

When updating allowed frontend domains, redeploy without running `--guided`:

```bash
sam deploy --parameter-overrides AllowedOrigins="https://main.<app-id>.amplifyapp.com,http://localhost:5173"
```

---

## 7. Connecting Frontend (AWS Amplify Hosting)

1. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify).
2. Select your portfolio application.
3. In the left navigation, click **App settings** → **Environment variables**.
4. Add the variable:
   - **Key**: `VITE_CONTACT_API_URL`
   - **Value**: `https://<api-id>.execute-api.ap-south-1.amazonaws.com/contact`
5. Click **Save**.
6. **Trigger a Redeploy**: In Vite, `VITE_*` environment variables are baked into static assets at build time. Trigger a redeploy in Amplify (**Run build**) so the updated endpoint is bundled.

---

## 8. Local Testing with SAM Local

To test the API Gateway and Lambda locally with SAM:

1. Create a temporary `env.json` (do not commit real secrets):
```json
{
  "ContactFunction": {
    "SENDER_EMAIL": "yourname@example.com",
    "RECIPIENT_EMAIL": "yourname@example.com",
    "ALLOWED_ORIGINS": "http://localhost:5173",
    "SES_REGION": "ap-south-1"
  }
}
```

2. Start the local API server:
```bash
sam local start-api --env-vars env.json --port 3001
```

*(Note: SES dispatches will communicate with AWS SES using your local AWS credentials).*

---

## 9. Troubleshooting

### 1. CORS Errors
- **Trailing Slash Mismatch**: Browsers send the `Origin` header without a trailing slash (e.g., `https://main.<app-id>.amplifyapp.com`). If `AllowedOrigins` includes a trailing slash (`...amplifyapp.com/`), exact string matching fails and returns HTTP 403. Ensure origins in `AllowedOrigins` **never have a trailing slash**.
- **Protocol Mismatch**: Make sure `https://` is specified for deployed sites and `http://` for `localhost` (`http://localhost:5173`).
- **Preflight OPTIONS**: If testing from a browser, API Gateway HTTP API handles the preflight `OPTIONS` request. Ensure `OPTIONS` and `POST` are allowed methods.

### 2. CSP (Content Security Policy) Errors in Browser Console
- **Symptom**: Browser console error:
  ```text
  Refused to connect to 'https://<api-id>.execute-api.ap-south-1.amazonaws.com/contact' because it violates the following Content Security Policy directive: "connect-src 'self' ...".
  ```
- **Cause**: AWS Amplify `customHeaders` does **not** interpolate build environment variables (such as `VITE_CONTACT_API_URL`).
- **Fix**: In `amplify.yml`, the CSP directive must explicitly include the API Gateway wildcard endpoint for your region:
  ```yaml
  connect-src 'self' https://*.execute-api.ap-south-1.amazonaws.com;
  ```
  Ensure the region in `amplify.yml` matches where your SAM stack was deployed (e.g. `ap-south-1`).

### 3. Email Landing in Spam (Gmail Sender via SES)
- **Symptom**: The Lambda returns HTTP 200, but no email appears in your inbox.
- **Cause**: When using a `@gmail.com` address as the `SenderEmail` via AWS SES, Gmail's SPF and DMARC policies (`p=reject`) will cause receiving mail servers (or Gmail itself) to flag the email as spoofed, directing it to the Spam / Junk folder.
- **Fix**:
  1. Check your **Spam / Junk** folder in your inbox and mark the message as "Not Spam".
  2. For production deliverability, verify a custom domain in SES with DKIM records (`CNAME` records added to DNS), and use an address on that domain (e.g., `contact@yourdomain.com`).

### 4. SES Sandbox Restrictions
- **Symptom**: Lambda logs show `MessageRejected` or `Email address is not verified`.
- **Cause**: New AWS accounts are placed in the SES Sandbox by default. In sandbox mode, SES will only send emails **to verified email addresses**.
- **Fix**: Use the same verified email address for both `SenderEmail` and `RecipientEmail`. When both are identical, SES sandbox allows the dispatch without requiring production access. To send emails to arbitrary recipients, submit an SES production access request in the AWS SES Console.

### 5. How to Read CloudWatch Logs
- **Tail Live Invocations via SAM CLI**:
  ```bash
  sam logs -n ContactFunction --stack-name portfolio-contact-backend --tail
  ```
- **Via AWS Management Console**:
  1. Open **CloudWatch** → **Logs** → **Log groups**.
  2. Open `/aws/lambda/portfolio-contact-backend-ContactFunction-...`.
  3. Click the latest log stream.
- **Structured JSON Format**:
  Every invocation outputs a single-line JSON log entry containing duration and status:
  - *Success*: `{"requestId":"...","durationMs":142,"statusCode":200,"sesMessageId":"0100..."}`
  - *Validation Error*: `{"requestId":"...","durationMs":4,"statusCode":400,"errorName":"ValidationError","invalidFields":["email"]}`
  - *Origin Rejection*: `{"requestId":"...","durationMs":2,"statusCode":403,"errorName":"ForbiddenOrigin"}`
  *(Note: Form message contents and visitor email addresses are never written to CloudWatch logs).*
