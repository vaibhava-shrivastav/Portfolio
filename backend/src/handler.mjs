/**
 * ==========================================================================
 * AWS Lambda Handler — Serverless Portfolio Contact Email Dispatcher
 * ==========================================================================
 * Runtime: Node.js 20 (ESM)
 * Architecture: arm64
 * Dependencies: @aws-sdk/client-ses (pre-installed in Node 20 runtime)
 * ==========================================================================
 * Security Controls:
 * - Strict CORS origin validation against ALLOWED_ORIGINS
 * - Rejects bodies > 10 KB (413)
 * - Pure field validation & CRLF header injection prevention (400)
 * - Honeypot bypass: silently returns { ok: true } without sending
 * - Structured minimal logging (never logs message body or email address)
 * - HTML entity escaping for XSS prevention in email clients
 * ==========================================================================
 */
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import {
  validatePayload,
  sanitizeHeader,
  escapeHtml,
  MAX_BODY_BYTES
} from './validate.mjs';

// Lazy-initialized SES Client singleton
let sesClient = null;

function getSesClient() {
  if (!sesClient) {
    const region = process.env.SES_REGION || process.env.AWS_REGION || 'ap-south-1';
    sesClient = new SESClient({ region });
  }
  return sesClient;
}

/**
 * Builds HTTP response with appropriate CORS headers
 */
function buildResponse(statusCode, body, origin = '') {
  const headers = {
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Access-Control-Max-Age'] = '600';
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

/**
 * Main Lambda Handler for API Gateway HTTP API (payload format 2.0 or 1.0)
 */
export async function handler(event, context = {}) {
  const startTime = Date.now();
  const requestId = context.awsRequestId || `req-${Date.now()}`;

  // 1. Resolve & validate origin
  const rawOrigin = event.headers?.origin || event.headers?.Origin || '';
  const allowedList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Fallback: allowed if no list configured or origin matches
  const isOriginAllowed = allowedList.length === 0 || allowedList.includes(rawOrigin);
  const matchedOrigin = isOriginAllowed && rawOrigin ? rawOrigin : (allowedList[0] || '*');

  // Handle preflight OPTIONS request
  const httpMethod = event.requestContext?.http?.method || event.httpMethod || '';
  if (httpMethod.toUpperCase() === 'OPTIONS') {
    return buildResponse(204, {}, isOriginAllowed ? rawOrigin : '');
  }

  // Reject untrusted browser origins
  if (!isOriginAllowed && rawOrigin) {
    console.warn(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 403,
      errorName: 'ForbiddenOrigin'
    }));
    return buildResponse(403, { ok: false, error: 'Forbidden origin' });
  }

  // 2. Decode & check payload size (reject > 10 KB)
  let rawBody = event.body || '';
  if (event.isBase64Encoded && rawBody) {
    try {
      rawBody = Buffer.from(rawBody, 'base64').toString('utf-8');
    } catch (e) {
      console.warn(JSON.stringify({
        requestId,
        durationMs: Date.now() - startTime,
        statusCode: 400,
        errorName: 'MalformedBase64'
      }));
      return buildResponse(400, { ok: false, error: 'Malformed base64 payload' }, matchedOrigin);
    }
  }

  const byteLength = Buffer.byteLength(rawBody, 'utf-8');
  if (byteLength > MAX_BODY_BYTES) {
    console.warn(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 413,
      errorName: 'PayloadTooLarge',
      bytes: byteLength
    }));
    return buildResponse(413, { ok: false, error: 'Payload exceeds 10 KB limit' }, matchedOrigin);
  }

  // 3. Safe JSON parsing
  let payload = {};
  try {
    payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});
  } catch (e) {
    console.warn(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 400,
      errorName: 'InvalidJSON'
    }));
    return buildResponse(400, { ok: false, error: 'Invalid JSON request body' }, matchedOrigin);
  }

  // 4. Validate input & check honeypot
  const validation = validatePayload(payload);

  if (validation.isHoneypot) {
    // Honeypot trapped: log minimal status and silently pretend success
    console.log(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 200,
      result: 'honeypot_trapped'
    }));
    return buildResponse(200, { ok: true }, matchedOrigin);
  }

  if (!validation.isValid) {
    console.warn(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 400,
      errorName: 'ValidationError',
      invalidFields: Object.keys(validation.errors)
    }));
    return buildResponse(
      400,
      {
        ok: false,
        error: 'Validation failed',
        errors: validation.errors
      },
      matchedOrigin
    );
  }

  // 5. Environment configuration check
  const senderEmail = process.env.SENDER_EMAIL;
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  if (!senderEmail || !recipientEmail) {
    console.error(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 500,
      errorName: 'MissingConfiguration'
    }));
    return buildResponse(500, { ok: false, error: 'Email service unconfigured' }, matchedOrigin);
  }

  const { name, email, message } = validation.sanitized;

  // 6. Construct SES email parameters
  const subject = sanitizeHeader(`Portfolio contact: ${name}`, 100);

  const textBody = `New contact message received via Portfolio:

Name: ${name}
Email: ${email}

Message:
${message}
`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; margin: 0; padding: 20px; background-color: #f9f9f9; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e5e5; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .header { font-size: 18px; font-weight: 700; color: #e50914; border-bottom: 2px solid #e50914; padding-bottom: 8px; margin-bottom: 16px; }
    .field { margin-bottom: 12px; }
    .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px; }
    .value { font-size: 15px; color: #111; }
    .message-box { background: #f4f4f4; border-left: 4px solid #e50914; padding: 14px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; word-break: break-word; }
    .footer { margin-top: 24px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">Incoming Portfolio Transmission</div>
    <div class="field">
      <div class="label">Sender Name</div>
      <div class="value">${escapeHtml(name)}</div>
    </div>
    <div class="field">
      <div class="label">Reply-To Address</div>
      <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #0066cc;">${escapeHtml(email)}</a></div>
    </div>
    <div class="field">
      <div class="label">Message</div>
      <div class="message-box">${escapeHtml(message).replace(/\n/g, '<br/>')}</div>
    </div>
    <div class="footer">Sent via Serverless Contact Form · AWS Lambda &amp; SES</div>
  </div>
</body>
</html>`;

  // 7. Dispatch SES SendEmailCommand
  try {
    const ses = getSesClient();
    const command = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [recipientEmail]
      },
      ReplyToAddresses: [email],
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Text: {
            Data: textBody,
            Charset: 'UTF-8'
          },
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      }
    });

    const sesResult = await ses.send(command);

    console.log(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 200,
      sesMessageId: sesResult.MessageId
    }));

    return buildResponse(200, { ok: true }, matchedOrigin);
  } catch (err) {
    console.error(JSON.stringify({
      requestId,
      durationMs: Date.now() - startTime,
      statusCode: 500,
      errorName: err.name || 'SESDispatchError'
    }));

    return buildResponse(
      500,
      { ok: false, error: 'Email delivery failed. Please try again or email directly.' },
      matchedOrigin
    );
  }
}
