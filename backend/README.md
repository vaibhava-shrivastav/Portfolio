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

1. **AWS CLI** installed and configured (`aws configure`) with appropriate administrative or deployment permissions.
2. **AWS SAM CLI** installed (`sam --version`).
3. **Verified SES Sender Identity**:
   - In the [AWS SES Console](https://console.aws.amazon.com/ses), verify your sender email address (or domain) in your target AWS region (e.g., `ap-south-1` or `us-east-1`):
     - Click **Identities** → **Create identity** → choose **Email address** → enter `portfolio@yourdomain.com` (or your personal email).
     - Confirm the verification link sent to that inbox.
   - *Note on SES Sandbox*: If your AWS account is in the SES Sandbox, you must also verify the `RecipientEmail` address before SES will deliver emails to it, or request production access in the SES console.

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
Run guided deployment for your first deployment:

```bash
sam deploy --guided
```

You will be prompted for parameter values:
- **Stack Name**: `portfolio-contact-backend` (or your choice)
- **AWS Region**: e.g. `ap-south-1` (or your preferred region)
- **Parameter SenderEmail**: `<SenderEmail>` (e.g. `portfolio@yourdomain.com` or your verified SES email)
- **Parameter RecipientEmail**: `<RecipientEmail>` (e.g. `your-inbox@example.com`)
- **Parameter AllowedOrigins**: `https://<your-amplify-app-domain>,http://localhost:5173`
- **Parameter SesRegion**: Leave blank to default to the stack deployment region, or specify if SES identity is in another region (e.g. `ap-south-1`).
- **Confirm changes before deploy**: `y` (or `n`)
- **Allow SAM CLI IAM role creation**: `y` (required to create the scoped execution role)
- **Disable rollback for deployments**: `n`
- **Save arguments to configuration file**: `y`
- **SAM configuration file [samconfig.toml]**: Press Enter (default)
- **SAM configuration environment [default]**: Press Enter (default)

---

## 4. Obtain the API Endpoint URL

At the end of the deployment output, look for the **Outputs** section:

```text
Key                 ApiUrl
Description         Full HTTPS URL for the contact form API endpoint
Value               https://<api-id>.execute-api.<region>.amazonaws.com/contact
```

Copy the `Value` URL. This is your `ApiUrl`.

---

## 5. Smoke Testing the Deployed Endpoint

Run a test POST request with `curl`:

```bash
curl -i -X POST https://<api-id>.execute-api.<region>.amazonaws.com/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Tester","email":"test@example.com","message":"Hello from curl testing"}'
```

Expected response:
```http
HTTP/2 200
content-type: application/json

{"ok":true}
```

Verify that the contact notification arrives in your destination inbox with both plain text and HTML cards formatted with sender details.

---

## 6. Updating Allowed Origins / Parameters

When you have your final AWS Amplify production domain, update the stack parameters without running `--guided`:

```bash
sam deploy --parameter-overrides AllowedOrigins="https://yourcustomdomain.com,https://main.xxxxxx.amplifyapp.com,http://localhost:5173"
```

---

## 7. Connecting Frontend (AWS Amplify Hosting)

1. Open the **AWS Amplify Console** for your portfolio app.
2. Navigate to **App settings** → **Environment variables**.
3. Add a new variable:
   - **Key**: `VITE_CONTACT_API_URL`
   - **Value**: `https://<api-id>.execute-api.<region>.amazonaws.com/contact`
4. Trigger a new build / deployment in Amplify Hosting so Vite bakes this endpoint into the production build bundle.

---

## 8. Local Testing with SAM Local

To test the API Gateway and Lambda locally with SAM:

1. Create a temporary `env.json` (do not commit secrets):
```json
{
  "ContactFunction": {
    "SENDER_EMAIL": "portfolio@yourdomain.com",
    "RECIPIENT_EMAIL": "your-inbox@example.com",
    "ALLOWED_ORIGINS": "http://localhost:5173",
    "SES_REGION": "ap-south-1"
  }
}
```

2. Start the local API server:
```bash
sam local start-api --env-vars env.json --port 3001
```

3. Note: SES dispatches will still communicate with real AWS SES using your local AWS CLI credentials (`~/.aws/credentials`).

---

## 9. CloudWatch Logs & Debugging

Lambda logs are stored in the CloudWatch Log Group `/aws/lambda/<StackName>-ContactFunction-...` with a 14-day retention period.

To view live invocation logs using SAM CLI:
```bash
sam logs -n ContactFunction --stack-name portfolio-contact-backend --tail
```

Logs are structured JSON lines containing only `requestId`, `durationMs`, and `statusCode`:
```json
{"requestId":"c4a89f...","durationMs":142,"statusCode":200,"sesMessageId":"0100018..."}
```
*Note: Personal data such as message bodies and email addresses are never recorded in logs.*
