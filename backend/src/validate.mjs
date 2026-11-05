/**
 * ==========================================================================
 * Contact Validation & HTML Escaping Utility (Backend)
 * ==========================================================================
 * Pure functions with zero external dependencies.
 * Enforces strict RFC email validation, header injection prevention,
 * input bounds, and XSS sanitization.
 * ==========================================================================
 */

export const MAX_BODY_BYTES = 10240; // 10 KB
export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_MESSAGE_LENGTH = 10;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_SUBJECT_LENGTH = 100;

/**
 * Strips non-printable ASCII control characters.
 * Preserves normal whitespace (spaces, tabs, newlines).
 */
export function sanitizeText(val = '') {
  if (typeof val !== 'string') return '';
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Sanitizes header values (e.g. Subject) by stripping all newlines and control characters
 * to prevent email header injection attacks (CRLF injection).
 */
export function sanitizeHeader(val = '', maxLength = MAX_SUBJECT_LENGTH) {
  if (typeof val !== 'string') return '';
  const noNewlines = val.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
  return noNewlines.slice(0, maxLength);
}

/**
 * Escapes characters with HTML entities to prevent XSS in HTML email rendering.
 */
export function escapeHtml(str = '') {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates the contact form payload.
 * Returns:
 * {
 *   isValid: boolean,
 *   isHoneypot: boolean,
 *   errors: { [field]: string },
 *   sanitized: { name: string, email: string, message: string }
 * }
 */
export function validatePayload(data = {}) {
  const errors = {};

  // Check honeypot: if populated, silently treat as honeypot trigger
  const rawWebsite = typeof data.website === 'string' ? data.website.trim() : '';
  if (rawWebsite) {
    return {
      isValid: true,
      isHoneypot: true,
      errors: {},
      sanitized: { name: '', email: '', message: '' }
    };
  }

  const rawName = typeof data.name === 'string' ? data.name : '';
  const rawEmail = typeof data.email === 'string' ? data.email : '';
  const rawMessage = typeof data.message === 'string' ? data.message : '';

  // 1. Header injection check: Name and Email MUST NOT contain newline characters (\r, \n)
  if (/[\r\n]/.test(rawName)) {
    errors.name = 'Name must not contain newline characters.';
  }
  if (/[\r\n]/.test(rawEmail)) {
    errors.email = 'Email address must not contain newline characters.';
  }

  // 2. Name validation (1 to 80 chars after trimming)
  const cleanName = sanitizeText(rawName);
  if (!errors.name) {
    if (!cleanName) {
      errors.name = 'Name is required (1 to 80 characters).';
    } else if (cleanName.length > MAX_NAME_LENGTH) {
      errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer (currently ${cleanName.length}).`;
    }
  }

  // 3. Email validation (RFC 5322 compliant, max 254 chars)
  const cleanEmail = sanitizeText(rawEmail);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!errors.email) {
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please provide a valid email address (e.g. name@domain.com).';
    } else if (cleanEmail.length > MAX_EMAIL_LENGTH) {
      errors.email = `Email address is too long (maximum ${MAX_EMAIL_LENGTH} characters).`;
    }
  }

  // 4. Message validation (10 to 2000 chars)
  const cleanMessage = sanitizeText(rawMessage);
  if (!cleanMessage) {
    errors.message = `Message is required (${MIN_MESSAGE_LENGTH} to ${MAX_MESSAGE_LENGTH} characters).`;
  } else if (cleanMessage.length < MIN_MESSAGE_LENGTH) {
    errors.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters (currently ${cleanMessage.length}).`;
  } else if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer (currently ${cleanMessage.length}).`;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    isHoneypot: false,
    errors,
    sanitized: {
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage
    }
  };
}
